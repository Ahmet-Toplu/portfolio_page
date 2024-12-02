# Portfolio Website

This project is a portfolio website built with **Node.js**, **Express**, and **MySQL**. It showcases various projects, allows users to contact the owner, and includes an admin section to manage messages.

### Features
- **Project Showcase**: Displays a list of projects with images, descriptions, and GitHub links.
- **Search Functionality**: Allows users to search for specific projects by name.
- **Comment Section**: Users can leave comments on projects (requires login).
- **Authentication**: User login and registration with bcrypt password hashing.
- **Admin Panel**: Admins can view messages sent through the contact form.
- **Responsive Design**: Works seamlessly across different devices.

### Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: EJS, CSS
- **Database**: MySQL
- **Authentication**: Express-session, bcrypt
- **Deployment**: Docker (optional)

## Getting Started
### Prerequisites
- Node.js (v18.20.5 or later)
- MySQL (v8 or later)
- Docker (optional for containerized deployment)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmet-Toplu/portfolio_page.git
   cd portfolio_page
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the .env variables:
   ```env
   GITHUB_TOKEN=<your-github-token>
   ```
4. Setup the database:
   - Local MySQL server:
       - Import the init.sql file into your MySQL database:
         ```bash
         mysql -u portfolio -p portfolio < init.sql
         ```
    - Docker container:
      - Build the Docker Image:
        ```bash
        docker build -t portfolio-mysql .
        ```
      - Run the MySQL container:
        ```bash
        docker run -d \
        --name my-mysql-container \
        portfolio-mysql
        ```
5. Run the project locally:
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```

## Usage
### Search Projects
- Navigate to the "Explore My Projects" page.
- Use the search bar to filter projects by name.

### Comment on Projects
1. Log in or register to create an account.
2. Visit a project page.
3. Leave a comment in the provided form.

### Admin Panel
- Accessible only to admin users.
- View all messages sent via the contact form.

## API Endpoints
### Public Endpoints
- `GET /api/projects`: List all the projects.

## Contact
For any inquiries, feel free to reach out via:
- LinkedIn: Ahmet Toplu
- Email: alexxhhofman@gmail.com
