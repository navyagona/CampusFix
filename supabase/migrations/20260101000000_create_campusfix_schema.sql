-- CampusFix PostgreSQL Schema & Row Level Security Setup
-- Supported by Supabase Auth and Storage

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE report_category AS ENUM ('electrical', 'plumbing', 'classroom_equipment', 'cleanliness', 'other');
CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE report_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'duplicate', 'rejected', 'withdrawn');

-- 2. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically handle profile creation when new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper function to check staff/admin permission
CREATE OR REPLACE FUNCTION is_staff_or_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = check_user_id AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reports Table
CREATE SEQUENCE IF NOT EXISTS report_seq START WITH 1001;

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT NOT NULL UNIQUE DEFAULT ('CF-' || to_char(NOW(), 'YYYY') || '-' || nextval('report_seq')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    building TEXT NOT NULL,
    location_details TEXT NOT NULL,
    priority report_priority NOT NULL DEFAULT 'medium',
    status report_status NOT NULL DEFAULT 'submitted',
    photo_url TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performant querying
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to);

-- 4. Report Status History Table (Audit Log)
CREATE TABLE report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    from_status report_status,
    to_status report_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES profiles(id),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_report_id ON report_status_history(report_id);

-- 5. Report Internal Notes Table (Staff Only)
CREATE TABLE report_internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_internal_notes_report_id ON report_internal_notes(report_id);

-- 6. Row Level Security Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_internal_notes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles readable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own full_name only"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Reports Policies
CREATE POLICY "Students can view their own reports"
    ON reports FOR SELECT
    TO authenticated
    USING (created_by = auth.uid() OR is_staff_or_admin(auth.uid()));

CREATE POLICY "Authenticated users can submit reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid() AND status = 'submitted');

CREATE POLICY "Students can edit their submitted reports"
    ON reports FOR UPDATE
    TO authenticated
    USING (
        (created_by = auth.uid() AND status = 'submitted')
        OR is_staff_or_admin(auth.uid())
    )
    WITH CHECK (
        (created_by = auth.uid() AND (status = 'submitted' OR status = 'withdrawn'))
        OR is_staff_or_admin(auth.uid())
    );

-- Report Status History Policies
CREATE POLICY "Status history viewable by report owner or staff"
    ON report_status_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM reports
            WHERE reports.id = report_status_history.report_id
            AND (reports.created_by = auth.uid() OR is_staff_or_admin(auth.uid()))
        )
    );

CREATE POLICY "Status history insertable by authorized users"
    ON report_status_history FOR INSERT
    TO authenticated
    WITH CHECK (changed_by = auth.uid());

-- Internal Notes Policies (Staff only)
CREATE POLICY "Internal notes viewable by staff only"
    ON report_internal_notes FOR SELECT
    TO authenticated
    USING (is_staff_or_admin(auth.uid()));

CREATE POLICY "Internal notes insertable by staff only"
    ON report_internal_notes FOR INSERT
    TO authenticated
    WITH CHECK (is_staff_or_admin(auth.uid()) AND author_id = auth.uid());

-- Storage Bucket Setup (maintenance-photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-photos', 'maintenance-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public or authenticated users can view maintenance photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'maintenance-photos');

CREATE POLICY "Authenticated users can upload maintenance photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'maintenance-photos');
