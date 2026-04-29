# Reseldia 📅

Reseldia is a scalable, full-stack event management platform designed to streamline the creation, discovery, and management of events. It provides a robust environment for organizers to manage logistics and for attendees to engage with events through integrated polling and commenting systems.

## 🚀 Features

* **Comprehensive Event Management**: Create, edit, and delete events with ease.
* **Interactive Engagement**: Integrated polling widgets and comment sections for real-time attendee interaction.
* **User Authentication**: Secure registration and login system with JWT-based authentication.
* **Role-Based Access**: Specialized admin dashboard for high-level event and user oversight.
* **Responsive Design**: A modern UI built with Tailwind CSS that works seamlessly across desktop and mobile devices.
* **Dynamic Discovery**: Home page featuring event carousels and discovery tools.

## 🛠️ Tech Stack

### Frontend
* **React** with **Vite** for a high-performance development environment.
* **Tailwind CSS** for modern, utility-first styling.
* **Lucide React** for consistent, high-quality iconography.
* **Framer Motion** for smooth animations and transitions.

### Backend
* **Node.js & Express** providing a reliable and scalable API layer.
* **PostgreSQL** for robust relational data storage.
* **JWT (JSON Web Tokens)** for secure user session management.

## 📦 Installation

### Prerequisites
* Node.js and npm/yarn installed.
* A running PostgreSQL instance.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd Reseldia
    ```

2.  **Configure the Backend:**
    * Navigate to the `/backend` directory.
    * Create a `.env` file and include your database credentials and JWT secret.
    * Install dependencies:
        ```bash
        npm install
        ```
    * Start the server:
        ```bash
        node server.js
        ```

3.  **Configure the Frontend:**
    * Navigate to the `/frontend` directory.
    * Install dependencies:
        ```bash
        npm install
        ```
    * Start the development server:
        ```bash
        npm run dev
        ```

## 🖥️ Project Structure

* **/frontend**: Contains the React application, including pages for the dashboard, event details, and admin controls.
* **/backend**: Houses the Express server, database connection logic, and API routes for authentication, events, and polls.
