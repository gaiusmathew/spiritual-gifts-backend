/**
 * Test Delete User Endpoint
 * Handles authentication properly
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://spiritual-gifts-backend.vercel.app/api';
// Or use: 'http://localhost:5000/api' for local testing

const ADMIN_EMAIL = 'admin@spiritualgifts.com'; // Or your admin email
const USER_ID_TO_DELETE = 3; // Change this to the user ID you want to delete

let adminToken = null;

async function loginAsAdmin() {
  console.log('\n🔐 Step 1: Login as Admin\n');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL
    });
    
    adminToken = response.data.token;
    console.log('✅ Login successful!');
    console.log(`Token: ${adminToken.substring(0, 30)}...`);
    console.log(`User: ${response.data.user.fullname} (${response.data.user.role})\n`);
    
    if (response.data.user.role !== 'admin') {
      console.error('❌ ERROR: User is not an admin!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function deleteUser(userId) {
  console.log(`\n🗑️  Step 2: Delete User ${userId}\n`);
  
  try {
    const response = await axios.delete(
      `${API_URL}/admin/user/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ User deleted successfully!');
    console.log('\nDeleted User Info:');
    console.log(`  ID: ${response.data.deletedUser.id}`);
    console.log(`  Name: ${response.data.deletedUser.fullname}`);
    console.log(`  Email: ${response.data.deletedUser.email}`);
    console.log(`\n${response.data.message}\n`);
    
    return true;
  } catch (error) {
    console.error('\n❌ Delete failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.error('\n💡 Tips:');
      console.error('  - User ID might not exist');
      console.error('  - Check available users first');
    } else if (error.response?.status === 403) {
      console.error('\n💡 Tips:');
      console.error('  - You might be trying to delete an admin user');
      console.error('  - Admin users cannot be deleted');
    } else if (error.response?.status === 401) {
      console.error('\n💡 Tips:');
      console.error('  - Token might be invalid or expired');
      console.error('  - Make sure you\'re logged in as admin');
    }
    
    return false;
  }
}

async function listUsers() {
  console.log('\n📋 Bonus: List All Users\n');
  
  try {
    const response = await axios.get(
      `${API_URL}/admin/users`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    
    console.log(`Found ${response.data.users.length} users:\n`);
    response.data.users.forEach(user => {
      console.log(`  ID: ${user.id} | ${user.fullname} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');
    
  } catch (error) {
    console.log('Could not fetch users:', error.response?.data || error.message);
  }
}

async function run() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       TEST DELETE USER ENDPOINT                ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  console.log(`\nAPI URL: ${API_URL}`);
  console.log(`User to delete: ${USER_ID_TO_DELETE}`);
  
  // Step 1: Login
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.log('\n❌ TEST FAILED: Could not login as admin\n');
    process.exit(1);
  }
  
  // Optional: List users first
  await listUsers();
  
  // Step 2: Delete user
  const deleted = await deleteUser(USER_ID_TO_DELETE);
  
  if (deleted) {
    console.log('\n✅ TEST PASSED: User deleted successfully!\n');
  } else {
    console.log('\n❌ TEST FAILED: Could not delete user\n');
  }
}

// Run the test
run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

