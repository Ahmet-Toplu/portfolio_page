-- Create the portfolio database if not exists
CREATE DATABASE IF NOT EXISTS portfolio;

-- Select the database before creating tables
USE portfolio;

-- Create the user and set the password
CREATE USER 'portfolio'@'localhost' IDENTIFIED BY 'portfolio';

-- Grant all privileges to the user for the portfolio database
GRANT ALL PRIVILEGES ON portfolio.* TO 'portfolio'@'localhost';

-- Apply privilege changes
FLUSH PRIVILEGES;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    admin BOOLEAN DEFAULT FALSE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    github VARCHAR(255) NOT NULL,
    folder VARCHAR(255) NOT NULL
);

-- Create comments table with foreign keys user_id and project_id
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    project_id INT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_id INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_comment_project ON comments(project_id);

-- Insert data into the projects table
INSERT INTO projects (id, name, description, github, folder) VALUES
(1, 'Care Compass', 'CareCompass will redefine healthcare management by empowering users to take control of their wellness journey. Through a user-centric design, it will offer tools to overcome knowledge barriers, provide personalized suggestions, and connect users with licensed healthcare providers via an intuitive mapping feature. Users can effortlessly find and engage with nearby specialists based on reviews and expertise, enhancing healthcare experiences and outcomes. The platform will adopt a holistic approach, prioritizing well-being beyond treatments. It will feature smart medication reminders, AI chatbots for clear health guidance, and a vibrant community for support and shared experiences. Studies show these features improve adherence, reduce anxiety, and foster connection, promoting both physical and mental health. CareCompass will prioritize user privacy with robust security measures, including multifactor authentication, encryption, and GDPR/HIPAA compliance. Additionally, personalized health content tailored to individual goals will keep users informed on fitness, nutrition, and mental well-being. This all-in-one platform will combine cutting-edge technology, security, and empathy to transform how users engage with their healthcare.', 'https://github.com/Ahmet-Toplu/HealthApp', '/images/CareCompass'),
(2, 'Number Recognition', 'This Number Recognition Program is a machine learning project developed by me, a university student, as part of a learning journey in understanding neural networks and their applications. The program uses a simple neural network to recognize handwritten digits (0-9) and aims to showcase the foundational principles of neural network architecture, training, and inference.', 'https://github.com/Ahmet-Toplu/Number_Recognition', '/images/NumberRecognition');

-- Insert admin user into the users table (hashed password)
INSERT INTO users (id, username, email, password, admin) VALUES
(1, 'AhmetToplu', 'alexxhhofman@gmail.com', '$2b$10$Bx/.3H590FIj2oLNdLUuQ.UvdJ5QsL9/Ztw4RQyyd8GqykRVTuHIG', 1);