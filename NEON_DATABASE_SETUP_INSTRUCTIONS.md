# Neon Database Setup Instructions

## Complete Neon Database Configuration

You have successfully updated the project configuration files to use the Neon database, but you need to complete the setup with your actual database credentials.

### Step 1: Get Your Neon Database Credentials

1. Log in to your Neon account at https://console.neon.tech/
2. Go to your project dashboard
3. Click on your project (likely named "neondb")
4. Navigate to the "Connection Details" section
5. Copy the connection string which should look like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Update Environment Files

Replace the placeholder credentials in the following files with your actual credentials:

#### Update `apps/backend/.env`:
```env
DATABASE_URL="postgresql://your_actual_username:your_actual_password@ep-flat-wave-ad7kmycs.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### Update `docker-compose.yml`:
In the backend service environment section:
```yaml
environment:
  DATABASE_URL: postgresql://your_actual_username:your_actual_password@ep-flat-wave-ad7kmycs.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Run Prisma Generate and Database Migrations

After updating the credentials, run the following commands:

```bash
cd d:\shoopHouse_E
pnpm db:generate
pnpm db:migrate
```

Note: If you encounter permission errors with `pnpm db:generate`, you may need to stop any running Node processes first before running the command.

### Step 4: Seed the Database

Once migrations are successful, run:

```bash
pnpm db:seed
```

### Step 5: Verify Connection

You can verify the database connection by running:

```bash
pnpm db:studio
```

This will open Prisma Studio where you can view and manage your database data.

### Troubleshooting

- If you get authentication errors, double-check your username and password
- Make sure the `sslmode=require` parameter is included in the connection string
- Ensure you're using the correct endpoint from your Neon dashboard
- If migrations fail, make sure the database schema exists in Neon (you may need to run the SQL from `database_setup_neon.sql` in the Neon SQL Editor first)

### Note about the New roleId Field

This update adds a numeric `roleId` field to the User model to support the requirement where users with `roleId=4` are treated as admin equivalents. The system now:

- Assigns `roleId=1` to ADMIN users
- Assigns `roleId=2` to SELLER users
- Assigns `roleId=3` to BUYER users (by default)
- Treats users with `roleId=4` as admin equivalents with full admin access

The seeding script creates a default user with `roleId=4` (email: admin-eq@shoophouse.com) for testing this functionality.

### Note about Neon Free Tier

Remember that Neon provides a free tier with limited resources. Make sure to monitor your usage and understand the limitations of the free tier.