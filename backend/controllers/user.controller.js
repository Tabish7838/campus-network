const User = require('../models/User');

const getMyProfile = async (req, res) => {
  try {
    let userProfile = await User.findById(req.user.id);

    // If profile doesn't exist, create it (first-time login)
    if (!userProfile) {
      const newUser = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.name || req.user.email.split('@')[0], // Use provided name or default
        college: req.user.user_metadata?.college || null,
        course: req.user.user_metadata?.course || null,
        branch: req.user.user_metadata?.branch || null,
        year: req.user.user_metadata?.year || null,
        role: 'student', // Default role
      };
      userProfile = await User.create(newUser);
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: `Error fetching or creating profile: ${error.message}` });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userProfile = await User.findById(id);

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: `Error fetching profile: ${error.message}` });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, college, course, branch, year } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (college !== undefined) updateData.college = college;
    if (course !== undefined) updateData.course = course;
    if (branch !== undefined) updateData.branch = branch;
    if (year !== undefined) updateData.year = year;

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }
    
    const updatedProfile = await User.updateProfile(req.user.id, updateData);

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: `Error updating profile: ${error.message}` });
  }
};

const requestAdminUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const ADMIN_UUID = '6ba34c09-da2b-4887-8a2e-d659463e274e';

    // Check if the user's UUID matches the admin UUID
    if (userId !== ADMIN_UUID) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized to become an admin.',
        success: false 
      });
    }

    // Get current user profile
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if user is already an admin
    if (userProfile.role === 'admin') {
      return res.status(200).json({ 
        message: 'You are already an admin!',
        success: true,
        profile: userProfile
      });
    }

    // Update user role to admin
    const updatedProfile = await User.updateProfile(userId, { role: 'admin' });

    res.status(200).json({
      message: 'Congratulations! You have been upgraded to admin.',
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ 
      message: `Error processing admin upgrade: ${error.message}`,
      success: false 
    });
  }
};

const requestStartupUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const ADMIN_UUID = '6ba34c09-da2b-4887-8a2e-d659463e274e';

    // Get current user profile
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if user is already a startup
    if (userProfile.role === 'startup') {
      return res.status(200).json({ 
        message: 'You are already registered as a startup!',
        success: true,
        profile: userProfile
      });
    }

    // Prevent unauthorized admin accounts from changing roles
    // Only the authorized admin UUID can switch roles freely
    if (userProfile.role === 'admin' && userId !== ADMIN_UUID) {
      return res.status(403).json({
        message: 'Admin accounts cannot change roles.',
        success: false
      });
    }

    // Update user role to startup
    const updatedProfile = await User.updateProfile(userId, { role: 'startup' });

    res.status(200).json({
      message: 'Congratulations! You have been upgraded to startup account.',
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ 
      message: `Error processing startup upgrade: ${error.message}`,
      success: false 
    });
  }
};

const requestStudentUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const ADMIN_UUID = '6ba34c09-da2b-4887-8a2e-d659463e274e';

    // Get current user profile
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if user is already a student
    if (userProfile.role === 'student') {
      return res.status(200).json({ 
        message: 'You are already registered as a student!',
        success: true,
        profile: userProfile
      });
    }

    // Prevent unauthorized admin accounts from changing roles
    // Only the authorized admin UUID can switch roles freely
    if (userProfile.role === 'admin' && userId !== ADMIN_UUID) {
      return res.status(403).json({
        message: 'Admin accounts cannot change roles.',
        success: false
      });
    }

    // Update user role to student
    const updatedProfile = await User.updateProfile(userId, { role: 'student' });

    res.status(200).json({
      message: 'Successfully switched to student account.',
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ 
      message: `Error processing student upgrade: ${error.message}`,
      success: false 
    });
  }
};

module.exports = {
  getMyProfile,
  getProfileById,
  updateProfile,
  requestAdminUpgrade,
  requestStartupUpgrade,
  requestStudentUpgrade,
};
