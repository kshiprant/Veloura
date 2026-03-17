export async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const publicBaseUrl =
      process.env.PUBLIC_BACKEND_URL ||
      `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;

    const photoUrl = `${publicBaseUrl}/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.photos = [photoUrl];
    await user.save();

    return res.json({
      message: 'Photo uploaded successfully',
      photoUrl,
      user,
    });
  } catch (error) {
    console.error('upload profile photo error', error);
    return res.status(500).json({ message: 'Could not upload photo' });
  }
}
