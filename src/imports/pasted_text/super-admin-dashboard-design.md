2. Super Admin Dashboard — UI Style and Structure
Design objective

The Super Admin dashboard must feel like:

a high-level control center
secure and organized
efficient for platform management
modern SaaS admin interface

The Super Admin is not just editing content. This user controls:

users
permissions
websites
platform settings
monitoring
publishing governance

So the UI should reflect authority and clarity.

Global layout

Use a classic SaaS dashboard layout:

Left Sidebar

Primary navigation

Top Header

Context, search, actions, profile

Main Content Area

Cards, tables, forms, analytics, settings panels

Optional right-side drawer / modal

For quick actions, details, confirmations

Visual style
Layout style
light dashboard with white cards over soft gray background
clear section spacing
grid-based layout
strong use of cards and tables
subtle shadows, rounded-xl corners
minimal separators
Icons

Use line icons consistently, for example:

LayoutDashboard
Users
ShieldCheck
Settings
FileText
Image
Globe
Languages
MenuSquare
Search
Bell
LogOut
Monitor
Upload
CheckCircle2
AlertTriangle
3. Super Admin Dashboard Layout
A. Sidebar

The sidebar should be fixed on desktop and collapsible on tablet/mobile.

Top
logo
platform name
optional workspace label
Navigation items
Dashboard
Users
Roles & Permissions
Websites / Projects
Pages
Articles
Media Library
Menus
Translations
Site Settings
Global Settings
Activity Logs
Preview
Publish Center
Bottom
profile shortcut
logout
Sidebar style
dark sidebar or light sidebar with strong active state
icon + label
active item with colored pill or background highlight
collapsible mode with icons only
B. Topbar
Left side
current page title
breadcrumb
optional global search
Right side
search bar
notifications icon
language switcher
quick action button
profile dropdown
Profile dropdown
name
role badge: Super Admin
profile settings
logout
C. Dashboard Home

This is the first screen after login.

Top summary cards

A responsive grid of stats cards:

Total Users
Total Websites
Total Pages
Total Articles
Total Media
Published Websites

Each card contains:

icon
metric number
short label
optional trend or status text
Middle section

Two-column layout:

Left

Recent activity timeline

user created
website updated
page published
media uploaded
Right

Quick control panel

Create user
Create website
Assign role
Open global settings
Bottom section

Tables / overview panels:

latest users
latest websites
pending actions
system status
4. Main Super Admin UI Screens
Users Management
UI
table with search and filters
columns: name, email, role, status, created date, actions
button: Add user
Form drawer or modal
full name
email
password
role
account status
Actions
create
edit
activate / deactivate
reset password
delete
Roles & Permissions
UI
cards or table of roles
permission matrix view
module-by-module access toggles
Actions
define access rules
assign role permissions
preview access by role
Websites / Projects
UI
grid or table of client websites
each card: project name, client, language, status, last update
Actions
create project
open workspace
assign admins/editors
archive project
Global Settings
UI sections
platform branding
default language
default theme options
SEO defaults
security policies
Actions
update system-wide settings
define upload limits
manage default configurations
Activity Logs
UI
filterable log table
timestamp, user, action, module, status
Purpose
monitor sensitive actions
ensure traceability
Publish Center
UI

Checklist-based interface:

content completed
menu configured
SEO filled
translations checked
media valid
Actions
validate
publish
rollback status later in future versions
5. Functionalities the Super Admin controls through the UI

Based on your CMS logic, the Super Admin interface should allow control over these functions:

User administration
create user accounts
edit users
activate/deactivate accounts
reset passwords
assign roles
Role and permission control
define which role can access which module
manage role-based visibility
secure critical modules
Website/project governance
create and manage website projects
assign internal teams to a project
supervise project status
Global platform settings
configure system-wide defaults
define language settings
set platform branding
control upload/media policies
Monitoring and control
view activity logs
track recent operations
detect admin/editor actions
Content oversight
access pages, articles, media, menus, translations
supervise publication readiness
intervene when needed
Publication authority
review publication checklist
approve or trigger final publication
6. Recommended UI components

For both login and dashboard, use these modern components:

icon inputs
stat cards
data tables
filter bars
badges
tabs
modals
confirmation dialogs
side drawers
dropdown menus
toast notifications
breadcrumb navigation
empty states
loading skeletons
7. Recommended responsive behavior
Login
fully stacked on mobile
centered card
hide extra decorative blocks if space is limited
Dashboard
collapsible sidebar
cards become 1-column on mobile, 2-column on tablet, 4+ on desktop
tables become horizontally scrollable
topbar compresses actions into icons or dropdowns
8. Best first screens to design now

To start development cleanly, design these screens first:

Login page
Super Admin dashboard home
Users list
Create/Edit user modal
Roles & permissions page
Websites/projects list
Global settings page