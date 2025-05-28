# Group Management Backend Project

This project is a Node.js server for managing groups with different user roles.

## Installation

1. **Install Node.js dependencies**  
   ```bash
   npm install

2. **Create an SSL key**
   Generate a 64-character hexadecimal key (example: `38be715d0d82a58041d5c6f663371c2afa40d2482051de77bd8281df35c5de8f`) and place it in a file inside the `secret/keys/` directory.
   Example:

   ```bash
   echo "38be715d0d82a58041d5c6f663371c2afa40d2482051de77bd8281df35c5de8f" > secret/keys/ssl.key
   ```

3. **Configure environment variables**

   * Duplicate the `.env.example` file and rename it to `.env`
   * Fill in the required information:

     * Database credentials
     * Default role ID to assign to new users (in the provided sample database, this is `3`)

4. **Deploy the database**

   * Open DBeaver or any other SQL client
   * Import the provided `db_example.sql` file to initialize the database with sample data

---

The project is now ready to be launched.