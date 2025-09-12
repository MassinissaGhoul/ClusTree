# Clustree - Technical Report

## Project Overview

The application enables teachers to create student clusters and allows students to submit their preferences for group formation. The system incorporates optional grading mechanisms and uses Simulated Annealing Clustering algorithms to optimize group assignments based on student preferences.

## Architecture

### Technology Stack

Clustree application follows a modern full-stack architecture with clear separation of concerns. The frontend is built using Vue.js 3 with composition API for reactive user interfaces. The backend utilizes Node.js with RESTful API architecture for scalable server-side operations. PostgreSQL serves as the primary database for data persistence and relational data management. A separate C++ module implements the algorithm.

### System Components

The architecture consists of four main layers working in coordination. The presentation layer handles user interactions and interface rendering. The application layer manages business logic and API routing. The data layer provides persistent storage and database operations. The algorithm layer performs clustering optimization through external C++ modules.

### Communication Flow

Frontend components communicate with the backend through HTTP requests using Axios for API calls. CORS configuration enables cross-origin requests between frontend and backend services. Authentication is managed through PASETO tokens for secure session handling. The algorithm module operates as a separate service that can be invoked by the backend when clustering calculations are required.

## Frontend Implementation

### Framework and Libraries

The frontend is built using Vue.js 3 with the Composition API for enhanced component logic organization. Vue Router handles client-side routing and navigation guards for authentication. Pinia serves as the state management solution, replacing Vuex for better TypeScript support and simpler API. TailwindCSS provides utility-first styling with custom configuration for consistent design patterns.

### Component Architecture

The frontend uses Vue.js 3 with Composition API. This enhances component logic organization. Vue Router manages client-side routing. Navigation guards handle authentication. Pinia manages application state. It replaces Vuex for simpler API design. TailwindCSS handles styling with utility-first approach. Custom configuration ensures design consistency.

### Authentication System

The system supports role-based access control. Teachers and students have separate interfaces. Login and registration forms validate input and handle errors. The auth store manages sessions, tokens, and permissions. Route guards block unauthorized access to dashboards.

### User Interface Design

The interface uses bold, educational design patterns. Bright colors create clear visual hierarchy. The design adapts to mobile and desktop screens.

### State Management

Pinia stores manage different application states. The auth store handles authentication and user roles. The clusters store manages cluster data and student preferences. State persistence maintains consistency during navigation.

### Dashboard Features

The application provides different dashboards for teachers and students. Teachers create clusters by entering projet name, and student emails. The creation form includes optional grading configuration. Grade ranges are customizable. Teachers view all clusters in a grid layout. Cluster selection shows student lists and submitted preferences. Students view available clusters where they participate. The preference interface uses toggle switches for teammate selection. Optional grading allows numerical ratings for peers. The interface prevents self-selection. Clear feedback shows selection status.

### Form Handling and Validation

All forms validate input client-side with real-time feedback. Error messages display with consistent styling. Loading states show during API operations. Disabled states prevent duplicate submissions. 

### Routing and Navigation

Protected routes require authentication. Role-based routing redirects to appropriate dashboards. Navigation guards check authentication and user roles. Fallback routes redirect invalid URLs to home page.

## Backend Implementation

*[To be completed - Backend implementation pending]*


## Algorithm Implementation



### Goal and Setup

**Goal**:  
Split \( N \) nodes into \( K \) groups of almost equal size, maximizing the sum of edge weights inside each group.

**Size Rule**:  
Each group has either \( \lfloor N/K \rfloor \) or \( \lfloor N/K \rfloor + 1 \) nodes.


### Initial Grouping

1. Shuffle the node list randomly.  
2. Compute base size \( s = N \div K \) (integer division) and remainder \( r = N \mod K \).  
3. Assign:
   - First \( r \) groups get \( s + 1 \) nodes each.
   - Remaining \( K - r \) groups get \( s \) nodes each.

This ensures group sizes differ by at most one.


### Scoring Groups

- The score of a partition is the sum of weights of all edges whose endpoints are in the same group.
- When iterating over nodes, each edge is seen twice (i→j and j→i), so divide the total by 2 to get the correct sum.


### Annealing Loop

1. Start with the initial grouping and its score.  
2. Set parameters: temperature \( T_0 \), minimum temperature \( T_{min} \), cooling rate \( \alpha \), max iterations `maxIter`.  
3. Repeat until \( T < T_{min} \) or max iterations reached:
   - Pick two different groups at random.
   - Pick one node from each group at random.
   - Swap them, compute new score and \( \Delta = \text{newScore} - \text{oldScore} \).
   - Accept swap if:
     - \( \Delta \geq 0 \), or
     - with probability \( \exp(\Delta / T) \) if \( \Delta < 0 \).
   - If rejected, revert the swap.
   - Update \( T \leftarrow T \times \alpha \).

4. Keep the best partition found during all iterations.

### Avoiding Local Traps

- A local minimum is when no single swap improves the score, but a better partition exists elsewhere.
- Accepting some worse moves (via \( \exp(\Delta / T) \)) allows the algorithm to escape these traps.
- Multiple runs with different shuffles increase the chance of finding the global best.



## Version Control and Deployment

### Git Workflow

The project uses Git for version control with structured branching for feature development. Commit messages follow conventional patterns for clear change documentation.

### Development Environment

Environment configuration supports different settings for development and production. Package management uses npm with lock files for dependency consistency.

## Conclusion

The Clustree frontend provides a comprehensive interface for student clustering management with intuitive user experiences for both teachers and students. The modular architecture enables easy extension and maintenance of features. The system foundation supports the planned backend and algorithm integration for complete functionality.
