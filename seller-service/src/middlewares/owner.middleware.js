import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
export const verifyOwner = asyncHandler(async (req, _, next) => {
  const username = req.params.username;
  //checking current user is seller or not then check both user are same or not
  const shopowner = await User.findOne({ username: username }).select(
    "role _id"
  );
  if (shopowner.role != "SELLER") {
    throw new ApiError(400, "Unathorixed Acces");
  }

  //both loged user and shop owner is seller role no we will check both id same or not

  if (String(req.user._id) == String(shopowner._id)) {
    return next();
  }
  throw new ApiError(404, "Not Authorized To Edit");
});
