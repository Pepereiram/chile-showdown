import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import Team from "../models/team";
import TeamChilemon, { ITeamChilemon } from "../models/teamChilemon";
import Chilemon from "../models/chilemon";

// Helper: find chilemon name in DB by its numeric id
async function findChilemonName(id: number): Promise<string | null> {
  try {
    const doc = (await Chilemon.findOne({ id })) as any;
    return doc?.name ?? null;
  } catch (err) {
    console.error("Error finding chilemon name:", err);
    return null;
  }
}

const router = express.Router();

/**
 * Get all teams for the authenticated user
 */
router.get("/teams", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const teams = await Team.find({ userId });
    return res.status(200).json(teams);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching teams" });
  }
});

/**
 * Get a specific team by ID
 */
router.get("/teams/:id", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const team = await Team.findOne({ _id: req.params.id, userId });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    return res.status(200).json(team);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching team" });
  }
});

/**
 * Create a new team
 */
router.post("/teams", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, members } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Members array is required" });
    }

    if (members.length === 0 || members.length > 6) {
      return res.status(400).json({ error: "Team must have between 1 and 6 members" });
    }

    const team = new Team({ userId, name });
    const savedTeam = await team.save();

    // Ahora members es un array de objetos { pokemonId, moves }
    const teamMembers: ITeamChilemon[] = await Promise.all(
      members.map(async (member: { pokemonId: number; moves: number[] }, index: number) => {
        const nameFromDb = await findChilemonName(member.pokemonId);
        return {
          teamId: savedTeam._id,
          chilemonId: member.pokemonId,
          position: index,
          nickname: nameFromDb || `Pokemon${member.pokemonId}`,
          level: 100,
          moves: member.moves || [],
          effort: []
        } as ITeamChilemon;
      })
    );

    await TeamChilemon.insertMany(teamMembers);

    return res.status(201).json(savedTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({ error: "Error creating team" });
  }
});

/**
 * Update an existing team
 */
router.put("/teams/:id", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, members } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const team = await Team.findOne({ _id: req.params.id, userId });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    team.name = name;
    await team.save();

    if (members && Array.isArray(members)) {
      if (members.length === 0 || members.length > 6) {
        return res.status(400).json({ error: "Team must have between 1 and 6 members" });
      }

      await TeamChilemon.deleteMany({ teamId: team._id });

      const teamMembers: ITeamChilemon[] = await Promise.all(
        members.map(async (member: { pokemonId: number; moves: number[] }, index: number) => {
          const nameFromDb = await findChilemonName(member.pokemonId);
          return {
            teamId: team._id,
            chilemonId: member.pokemonId,
            position: index,
            nickname: nameFromDb || `Pokemon${member.pokemonId}`,
            level: 100,
            moves: member.moves || [],
            effort: []
          } as ITeamChilemon;
        })
      );
      await TeamChilemon.insertMany(teamMembers);
    }

    return res.status(200).json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    return res.status(500).json({ error: "Error updating team" });
  }
});

/**
 * Delete a team
 */
router.delete("/teams/:id", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const team = await Team.findOneAndDelete({ _id: req.params.id, userId });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    await TeamChilemon.deleteMany({ teamId: team._id });

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return res.status(500).json({ error: "Error deleting team" });
  }
});

/**
 * Get team members (Chilemon) for a specific team
 */
router.get("/teamChilemon", authenticate, async (req, res) => {
  try {
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: "teamId is required" });
    }

    const members = await TeamChilemon.find({ teamId }).sort({ position: 1 });
    return res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({ error: "Error fetching team members" });
  }
});

export default router;

