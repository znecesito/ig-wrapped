import express from "express";
import multer from "multer";
import { extractFollowers, extractFollowing } from "../parsers/instagramParsers.js";
import { findNonFollowers } from "../services/compareUsers.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post(
  "/upload",
  upload.fields([
    { name: "followersFile", maxCount: 1 },
    { name: "followingFile", maxCount: 1 }
  ]),
  (req, res, next) => {
    try {
      const followersFile = req.files?.followersFile?.[0];
      const followingFile = req.files?.followingFile?.[0];

      if (!followersFile || !followingFile) {
        return res
          .status(400)
          .json({ error: "Both followersFile and followingFile are required." });
      }

      const followers = extractFollowers(followersFile.buffer);
      const following = extractFollowing(followingFile.buffer);
      const nonFollowers = findNonFollowers(followers, following);

      console.log(
        `[upload] followers=${followers.length} following=${following.length} non_followers=${nonFollowers.length}`
      );

      return res.json({ non_followers: nonFollowers });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
