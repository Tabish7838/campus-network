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
    const { name, college, course, branch, year, role } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (college !== undefined) updateData.college = college;
    if (course !== undefined) updateData.course = course;
    if (branch !== undefined) updateData.branch = branch;
    if (year !== undefined) updateData.year = year;
    
    // Handle role updates with validation
    if (role !== undefined) {
      const validRoles = ['student', 'startup', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role. Valid roles are: student, startup, admin.' 
        });
      }
      
      // Restrict admin role to specific UUID only
      if (role === 'admin') {
        const ADMIN_UUID = 'dc6cf991-7fbb-44de-ab35-aa014070914a';
        if (req.user.id !== ADMIN_UUID) {
          return res.status(403).json({ 
            message: 'Access denied. You do not have permission to become an admin.' 
          });
        }
      }
      
      updateData.role = role;
    }

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

module.exports = {
  getMyProfile,
  getProfileById,
  updateProfile,
};
