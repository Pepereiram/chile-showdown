import express from 'express';
import User from '../models/users';
import TeamChilemon from '../models/teamChilemon';
import Team from '../models/team';

const router = express.Router();

router.post('/reset', async (req, res) => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await TeamChilemon.deleteMany({});

    res.status(200).json({ message: 'Database reset successfully.' });
});

export default router;