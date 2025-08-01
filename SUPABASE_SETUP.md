# Supabase Integration Setup

## Project Successfully Connected! ✅

Your iron-xpressmaster Next.js project has been successfully connected to your Supabase database.

## What was configured:

### 1. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://qehtgclgjhzdlqcjujpp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaHRnY2xnamh6ZGxxY2p1anBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDk2NzYsImV4cCI6MjA2NjQyNTY3Nn0.P7buCrNPIBShznBQgkdEHx6BG5Bhv9HOq7pn6e0HfLo
```

### 2. Supabase Client Setup (`lib/supabase.ts`)
- Installed `@supabase/supabase-js` package
- Created a centralized Supabase client configuration
- Added error handling for missing environment variables

### 3. Database Schema Overview
Your database contains the following main tables:
- **users & profiles**: User management and profile data
- **categories & products**: Product catalog
- **orders & order_items**: Order management system
- **cart**: Shopping cart functionality
- **banners**: Marketing banners
- **services**: Available services
- **coupons**: Discount system
- **address_book**: User addresses
- **delivery_slots & pickup_slots**: Scheduling system
- **service_areas**: Geographic service coverage

### 4. Project Details
- **Project Name**: ironXpress
- **Project ID**: qehtgclgjhzdlqcjujpp
- **Region**: ap-south-1 (Asia Pacific - Mumbai)
- **Status**: Active and Healthy

## How to use Supabase in your components:

### Basic Usage
```typescript
import { supabase } from '@/lib/supabase'

// Fetch data
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)

// Insert data
const { data, error } = await supabase
  .from('products')
  .insert([
    { product_name: 'Test', product_price: 100 }
  ])
```

### Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('New order:', payload.new)
  })
  .subscribe()
```

## Test Component
A test component has been created at `components/test-supabase-connection.tsx` that you can use to verify the connection is working properly.

## Next Steps
1. Test the connection by running `npm run dev` and visiting your app
2. Import the test component to verify database connectivity
3. Start building your application features using the Supabase client
4. Consider setting up Row Level Security (RLS) policies for data protection

## Security Notes
- The `.env.local` file is already in `.gitignore` to prevent committing secrets
- The anonymous key is safe to use in client-side code
- Consider implementing RLS policies for sensitive data
- Use service role key only on server-side for admin operations

## Support
If you need help with specific queries or database operations, feel free to ask!
