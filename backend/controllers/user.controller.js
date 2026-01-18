const User = require('../models/User');

const getMyProfile = async (req, res) => {
  try {
    let userProfile = await User.findById(req.user.id);

    // If profile doesn't exist, create it (first-time login)
    if (!userProfile) {
      const newUser = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.email.split('@')[0], // Default name
        role: 'student', // Default role
      };
      userProfile = await User.create(newUser);
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: `Error fetching or creating profile: ${error.message}` });
  }
};

module.exports = {
  getMyProfile,
};
