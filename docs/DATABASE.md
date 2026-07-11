# Initial Database Plan

## Core tables

### profiles
- id
- display_name
- school
- graduation_year
- career_interests
- created_at
- updated_at

### companies
- id
- normalized_name
- display_name
- website_domain
- verification_status
- created_by
- created_at
- updated_at

### positions
- id
- company_id
- normalized_title
- display_title
- employment_type
- created_at
- updated_at

### interview_reports
- id
- author_id
- company_id
- position_id
- location
- application_period
- outcome
- difficulty
- advice
- is_publicly_anonymous
- moderation_status
- created_at
- updated_at

### interview_rounds
- id
- report_id
- round_number
- round_type
- duration_minutes
- format
- description
- created_at

### reported_questions
- id
- round_id
- question_text
- topic
- source_kind
- created_at

### applications
- id
- user_id
- company_id
- position_id
- custom_company_name
- custom_position_title
- stage
- application_date
- next_action
- next_action_date
- notes
- created_at
- updated_at

### application_stage_history
- id
- application_id
- previous_stage
- new_stage
- changed_at

### content_reports
- id
- reporter_id
- interview_report_id
- reason
- status
- created_at

## Authorization expectations

- Profiles: owner can update; public fields may be readable.
- Applications: owner only.
- Draft/pending interview reports: author and admins only.
- Approved interview reports: publicly readable.
- Moderation data: admins only.
