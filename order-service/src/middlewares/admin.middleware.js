import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id);
  if (!user || user.role !== "ADMIN") {
    return res
      .status(403)
      .json(new ApiError(403, "Access denied. You must be an admin."));
  }
  next();
});

export { verifyAdmin };
