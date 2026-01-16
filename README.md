### Campus Lost & Found System
> A modern, cloud-native web application designed to streamline the reporting and recovery of lost items within a campus environment.
 
#  Overview
> The Campus Lost & Found System addresses the issue of inefficient, scattered "lost item" reports on social media. It provides a centralized, digital platform where students and staff can post lost or found items, search a database in real-time, and securely claim items.
By leveraging Supabase (an open-source Firebase alternative), the application moves away from traditional server management to a serverless architecture, ensuring high performance, robust security via Row Level Security (RLS), and scalable data handling with PostgreSQL.
# Tech Stack
Frontend (Client)
 * Language: TypeScript (Strict typing for robust code)
 * Framework: React.js (v18+)
 * Styling: Native CSS (Modular & Responsive)
 * Build Tool: Vite
 * Routing: React Router DOM
Backend & Database (BaaS)
 * Platform: Supabase
 * Database: PostgreSQL (Relational Database)
 * Authentication: Supabase Auth (Email/Password, Social Logins)
 * Storage: Supabase Storage (For item image uploads)
 Key Features
#  Secure Authentication
 * Managed via Supabase Auth.
 * Supports secure Sign Up, Sign In, and Sign Out.
 * User sessions are persistent and secure.
     #  Item Management
 * Create Posts: Users can report "Lost" or "Found" items with details (Title, Category, Location, Date).
 * Image Uploads: Users can snap and upload photos of items, stored securely in Supabase Storage buckets.
 * Status Workflow: Items track through statuses: Lost → Found → Claimed.
3.  Real-Time Search & filtering
 * Instant filtering by category (Electronics, ID Cards, Keys).
 * Keyword search functionality to locate specific items quickly.
4. Claiming System
 * Users can submit "Claim Requests" on found items.
 * Item owners can view claims and choose to approve/reject them.
 * Row Level Security (RLS): Ensures only the item owner can modify or delete their post.
  # System Requirements
Functional Requirements
(What the system must DO)
 * User Registration: The system shall allow users to register using a valid campus email.
 * Post Creation: The system shall allow authenticated users to post lost or found items with a photo.
 * Catalog Viewing: The system shall display a feed of active items accessible to all users.
 * Search: The system shall provide a search bar to query items by title or description.
 * Claim Interaction: The system shall allow users to send a message to the poster of a "Found" item.
 * Moderation: The system shall allow the original poster to mark an item as "Recovered" or delete the post.
Non-Functional Requirements
(How the system performs)
 * Data Integrity: The system uses PostgreSQL foreign keys to ensure no orphan data exists (e.g., a claim cannot exist without an item).
 * Security: Database access is restricted using RLS (Row Level Security) policies; users cannot edit others' posts.
 * Performance: The application load time should be under 2 seconds on standard 4G networks (facilitated by Vite/React).
 * Scalability: The database can handle thousands of concurrent items without performance degradation.
 * Responsiveness: The UI must be fully responsive, adapting to Mobile, Tablet, and Desktop screens via CSS media queries.
# Project Scope
In-Scope (Deliverables)
 * Full-stack web application hosted on the cloud.
 * User authentication system.
 * Dashboard for viewing Lost vs. Found items.
 * Form interface for uploading images and details.
 * Profile page for managing user's own history.
Out-of-Scope (Future Work)
 * Mobile Native App: The project is a web app, not a downloadable .apk/.ipa file.
 * GPS Tracking: We record text-based locations (e.g., "Library"), not live GPS coordinates.
 * AI Image Recognition: The system does not automatically detect what object is in the uploaded photo.


The only requirement is having Node.js & npm installed 

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
