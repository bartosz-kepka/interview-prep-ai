# UI Architecture for Interview Prep AI

## 1. UI Structure Overview

The application is a responsive, mobile-first Single Page Application (SPA) built with Astro for server-side rendering and static content, and React for interactive UI components. The user interface is constructed using `shadcn/ui` components to ensure a consistent, accessible, and modern look and feel.

The architecture emphasizes clear user feedback through skeleton loaders, toast notifications, and inline validation messages. State management is handled locally within React components, using `react-hook-form` integrated with Zod for robust client-side form validation. The application follows a secure-by-design approach, with automated session handling and user-centric security warnings.

## 2. View List

### Authentication

|                         |                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Name**           | Login Page                                                                                                                                                                                                                                                                                                                                                                                      |
| **View Path**           | `/login`                                                                                                                                                                                                                                                                                                                                                                                        |
| **Main Purpose**        | To authenticate existing users.                                                                                                                                                                                                                                                                                                                                                                 |
| **Key Information**     | Email and password fields, a "Sign In" button, and links to the Sign Up and Forgot Password pages.                                                                                                                                                                                                                                                                                              |
| **Key View Components** | `Card`, `Input`, `Button`, `Label`, `Field`                                                                                                                                                                                                                                                                                                                                                     |
| **Considerations**      | - **UX**: Display a `Toast` on successful login after email verification or on session expiration redirect. Use `login-01` shadcn/ui block for a simple, focused layout. <br> - **Accessibility**: Ensure all form fields have associated labels. <br> - **Security**: Handle authentication errors by displaying a `Toast` message. Redirect to this page on `401 Unauthorized` API responses. |

|                         |                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Name**           | Sign Up Page                                                                                                                                                                                                                                                        |
| **View Path**           | `/signup`                                                                                                                                                                                                                                                           |
| **Main Purpose**        | To allow new users to create an account.                                                                                                                                                                                                                            |
| **Key Information**     | Email and password fields, a "Create Account" button, and a link to the Login page.                                                                                                                                                                                 |
| **Key View Components** | `Card`, `Input`, `Button`, `Label`, `Field`                                                                                                                                                                                                                         |
| **Considerations**      | - **UX**: Use `signup-01` shadcn/ui block. On success, redirect to the "Check Your Email" page. <br> - **Accessibility**: All form fields must have labels. <br> - **Security**: Implement client-side validation for password strength and email format using Zod. |

|                         |                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **View Name**           | Check Your Email Page                                                               |
| **View Path**           | `/check-email`                                                                      |
| **Main Purpose**        | To inform the user that a verification email has been sent after registration.      |
| **Key Information**     | A message instructing the user to check their email inbox to complete registration. |
| **Key View Components** | `Card`                                                                              |
| **Considerations**      | - **UX**: Provide a clear, simple message. No interactive elements are needed.      |

|                         |                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **View Name**           | Forgot Password Page                                                                                |
| **View Path**           | `/forgot-password`                                                                                  |
| **Main Purpose**        | To initiate the password reset process.                                                             |
| **Key Information**     | An email input field and a "Send Reset Link" button.                                                |
| **Key View Components** | `Card`, `Input`, `Button`, `Label`, `Field`                                                         |
| **Considerations**      | - **UX**: On success, show a `Toast` and redirect to a confirmation page or back to the login page. |

|                         |                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Name**           | Reset Password Page                                                                                                                                                                                       |
| **View Path**           | `/reset-password`                                                                                                                                                                                         |
| **Main Purpose**        | To allow users to set a new password using a token from their email.                                                                                                                                      |
| **Key Information**     | New password and confirm password fields, and a "Reset Password" button.                                                                                                                                  |
| **Key View Components** | `Card`, `Input`, `Button`, `Label`, `Field`                                                                                                                                                               |
| **Considerations**      | - **UX**: On success, redirect to the Login page with a success `Toast`. <br> - **Security**: The page should validate the token from the URL. The form must validate that the two password fields match. |

|                         |                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **View Name**           | Expired Link Page                                                                                  |
| **View Path**           | `/error/expired-link`                                                                              |
| **Main Purpose**        | To inform the user that the password reset or verification link has expired.                       |
| **Key Information**     | An error message explaining the issue and a button to navigate back to the "Forgot Password" page. |
| **Key View Components** | `Card`, `Button`                                                                                   |
| **Considerations**      | - **UX**: Provide a clear path for the user to restart the process.                                |

### Main Application

|                         |                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Name**           | My Questions Page                                                                                                                                                                                                                                                                                                                                                          |
| **View Path**           | `/questions`                                                                                                                                                                                                                                                                                                                                                               |
| **Main Purpose**        | To display, manage, and search the user's saved interview questions.                                                                                                                                                                                                                                                                                                       |
| **Key Information**     | A list of questions, a search bar, an "Add Question" button, and a "Load More" button.                                                                                                                                                                                                                                                                                     |
| **Key View Components** | `Input` (search), `Button`, `Collapsible` (for each question), `Skeleton`, `AlertDialog` (for delete), `Modal` (for add/edit).                                                                                                                                                                                                                                             |
| **Considerations**      | - **UX**: Use `Skeleton` loaders on initial load and when fetching more questions. Answers are hidden by default in a `Collapsible`. Use a "Load More" button for pagination, which becomes disabled when all questions are loaded. Display an empty state message if no questions exist. <br> - **Accessibility**: Use `aria-label` for icon-only buttons (Edit, Delete). |

|                         |                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View Name**           | AI Generator Page                                                                                                                                                                                                                                                                                                                                   |
| **View Path**           | `/generator`                                                                                                                                                                                                                                                                                                                                        |
| **Main Purpose**        | To generate interview questions from a job description or other text.                                                                                                                                                                                                                                                                               |
| **Key Information**     | A large `Textarea` for input, a "Generate" button, a list of generated questions with checkboxes, and a "Save Selected" button.                                                                                                                                                                                                                     |
| **Key View Components** | `Textarea`, `Button`, `Checkbox` (with indeterminate state), `Tooltip`, `Card`.                                                                                                                                                                                                                                                                     |
| **Considerations**      | - **UX**: Use a responsive two-column layout on desktop that stacks on mobile. Show a loading state while the AI is generating. Selected questions become editable in `Textarea` components. Display a character count below the input. <br> - **Accessibility**: Use `Tooltip` to differentiate between AI-generated and AI-edited questions. <br> |

## 3. User Journey Map

1.  **New User Registration**:
    - User lands on the **Sign Up Page**.
    - Fills in email and password and clicks "Create Account".
    - Is redirected to the **Check Your Email Page**.
    - User clicks the verification link in their email.
    - Is redirected to the **Login Page** with a success `Toast`.

2.  **User Login & Question Generation**:
    - User logs in on the **Login Page**.
    - Is redirected to the **My Questions Page**. If it's a new user, an empty state is shown.
    - User navigates to the **AI Generator Page**.
    - Pastes a job description into the `Textarea` and clicks "Generate".
    - The UI displays a list of generated questions with checkboxes.
    - User selects questions, optionally editing the text of the selected ones.
    - User clicks "Save Selected".
    - Is redirected back to the **My Questions Page** with a success `Toast`, where the newly saved questions are now listed.

3.  **Managing Existing Questions**:
    - From the **My Questions Page**, the user clicks the "Edit" button on a question.
    - An **Edit Question Modal** opens, pre-filled with the question and answer.
    - User makes changes and clicks "Save". The modal closes and the list updates.
    - User clicks the "Delete" button on a question.
    - A **Delete Confirmation Dialog** appears.
    - User clicks "Delete", and the question is removed from the list.

## 4. Layout and Navigation Structure

- **Main Layout**: A persistent header containing the application logo, navigation links, and user profile/actions dropdown. The main content for each view is rendered below the header.
- **Desktop Navigation**: The header displays text links for key navigation points (e.g., "My Questions", "AI Generator") and a user dropdown for "Logout".
- **Mobile Navigation**: The header collapses into a hamburger menu icon. Tapping the icon opens a `Sheet` component from the side, containing the navigation links.
- **Authentication Layout**: The auth pages (Login, Sign Up, etc.) use a simpler layout without the main navigation header to provide a focused experience.

## 5. Key Components

Use of `shadcn/ui` components is prioritized for consistency and accessibility. Consider custom components only when necessary.

- **Toast**: Used for non-blocking feedback for actions like successful saves, session expiration warnings, or API errors. Appears bottom-right on desktop and bottom-center on mobile.
- **AlertDialog**: A modal dialog used to confirm destructive actions, specifically deleting a question. It requires explicit user confirmation before proceeding.
- **Modal**: Used for focused tasks that require user input, such as adding a new question or editing an existing one. It overlays the main view.
- **Sheet**: A slide-out panel used for the primary navigation on mobile devices, triggered by a hamburger menu icon.
- **Collapsible/Accordion**: Used on the "My Questions" page to hide answers by default, reducing visual clutter and allowing users to focus on the questions.
- **Skeleton**: A loading indicator that mimics the final UI structure. Used on the "My Questions" page during initial data fetch and pagination to improve perceived performance.
- **Field**: A wrapper component from `shadcn/ui` used in forms to group a `Label`, `Input`, and error message, ensuring proper structure and accessibility.
- **Tooltip**: Provides contextual information on hover, used to distinguish between "Generated by AI" and "Generated by AI, edited by user" sources.
- **Checkbox (with Indeterminate State)**: Used on the AI Generator page for the "Select All" functionality, providing a clear visual cue when only a subset of items is selected.
