# HuddleUp Database

[TODO] Add proper docs for the HuddleUp database

## SQLState Conventions for Application

To help convert database exceptions to appropriate HTTP responses, the following mapping is established for the application:

| SQLState | Meaning (Exception Category) | HTTP Status |
| -------- | ---------------------------- | ----------- |
| 45001 | Validation Error | 400 Bad Request |
| 45002 | Resource Not Found | 404 Not Found |
| 45003 | Conflict / Constraint Violation | 409 Conflict |
| 45000 | Generic App Error / Fallback | 400 Bad Request |
