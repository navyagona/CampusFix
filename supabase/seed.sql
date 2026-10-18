-- CampusFix Realistic Sample Seed Data for Demo & Development
-- Note: Replace UUIDs with actual auth user IDs if connecting to a real Supabase Auth instance

-- Sample User UUIDs
-- Student 1: '11111111-1111-1111-1111-111111111111' (Alex Chen, student)
-- Student 2: '22222222-2222-2222-2222-222222222222' (Maya Patel, student)
-- Staff 1:   '33333333-3333-3333-3333-333333333333' (Dave Miller, Facilities Lead)
-- Staff 2:   '44444444-4444-4444-4444-444444444444' (Sarah Jenkins, Electrician)

-- Insert Profiles (assuming auth users exist or during local testing)
INSERT INTO profiles (id, email, full_name, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'alex.chen@campus.edu', 'Alex Chen', 'student'),
    ('22222222-2222-2222-2222-222222222222', 'maya.patel@campus.edu', 'Maya Patel', 'student'),
    ('33333333-3333-3333-3333-333333333333', 'dave.miller@campus.edu', 'Dave Miller', 'staff'),
    ('44444444-4444-4444-4444-444444444444', 'sarah.jenkins@campus.edu', 'Sarah Jenkins', 'staff')
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Insert Sample Reports
INSERT INTO reports (id, tracking_number, title, description, category, building, location_details, priority, status, created_by, assigned_to, resolution_note, resolved_at, created_at, updated_at)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'CF-2026-1001',
        'Projector HDMI input broken & image flickering',
        'The ceiling projector in lecture hall 204 keeps disconnecting every few minutes during presentations. The HDMI port on the podium seems loose.',
        'classroom_equipment',
        'Engineering Hall',
        'Room 204 (Main Lecture Hall)',
        'high',
        'in_progress',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        NULL,
        NULL,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'CF-2026-1002',
        'Water leak under sink in 2nd floor restroom',
        'There is a persistent puddle forming under the middle hand sink in the men''s restroom. Water is slowly dripping from the cold pipe fitting.',
        'plumbing',
        'Library East Wing',
        '2nd Floor Restroom near quiet study area',
        'medium',
        'acknowledged',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        NULL,
        NULL,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '18 hours'
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'CF-2026-1003',
        'Ceiling light fixture buzzing loudly and flickering',
        'The overhead fluorescent tube fixture directly above desk cluster 4 is buzzing loudly and rapidly flickering, causing headaches.',
        'electrical',
        'Student Center',
        '3rd Floor Study Lounge, Northwest Corner',
        'low',
        'submitted',
        '22222222-2222-2222-2222-222222222222',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours'
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'CF-2026-1004',
        'Liquid detergent spill on marble stairway',
        'Large slippery spill on the landing between floors 1 and 2. Slipping hazard for students walking between classes.',
        'cleanliness',
        'Arts Building',
        'Central Stairwell, between Floor 1 and 2',
        'urgent',
        'resolved',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'Janitorial staff deployed absorbent powder, mopped and dried the marble surface, and put up wet-floor signage for 30 minutes.',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '3 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Status History
INSERT INTO report_status_history (report_id, from_status, to_status, changed_by, comment, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', NULL, 'submitted', '11111111-1111-1111-1111-111111111111', 'Report submitted by student.', NOW() - INTERVAL '2 days'),
    ('a0000000-0000-0000-0000-000000000001', 'submitted', 'acknowledged', '33333333-3333-3333-3333-333333333333', 'AV team received the ticket and verified the equipment schedule.', NOW() - INTERVAL '1 day 12 hours'),
    ('a0000000-0000-0000-0000-000000000001', 'acknowledged', 'in_progress', '33333333-3333-3333-3333-333333333333', 'Technician dispatched to replace the wall plate adapter.', NOW() - INTERVAL '1 day'),

    ('a0000000-0000-0000-0000-000000000002', NULL, 'submitted', '11111111-1111-1111-1111-111111111111', 'Report submitted by student.', NOW() - INTERVAL '1 day'),
    ('a0000000-0000-0000-0000-000000000002', 'submitted', 'acknowledged', '33333333-3333-3333-3333-333333333333', 'Assigned to plumbing shift for inspection this afternoon.', NOW() - INTERVAL '18 hours'),

    ('a0000000-0000-0000-0000-000000000003', NULL, 'submitted', '22222222-2222-2222-2222-222222222222', 'Report submitted by student.', NOW() - INTERVAL '5 hours'),

    ('a0000000-0000-0000-0000-000000000004', NULL, 'submitted', '11111111-1111-1111-1111-111111111111', 'Report submitted by student.', NOW() - INTERVAL '6 hours'),
    ('a0000000-0000-0000-0000-000000000004', 'submitted', 'in_progress', '33333333-3333-3333-3333-333333333333', 'Priority cleanup dispatched.', NOW() - INTERVAL '5 hours'),
    ('a0000000-0000-0000-0000-000000000004', 'in_progress', 'resolved', '33333333-3333-3333-3333-333333333333', 'Janitorial team mopped and dried the stairway area.', NOW() - INTERVAL '3 hours');

-- Insert Internal Staff Notes
INSERT INTO report_internal_notes (report_id, author_id, note, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Need to check if spare Crestron transmitter box is in storage room 102.', NOW() - INTERVAL '1 day 6 hours'),
    ('a0000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'If the washer replacement doesn''t seal it, main shutoff valve on floor 2 may need quick replacement during evening hours.', NOW() - INTERVAL '12 hours');
