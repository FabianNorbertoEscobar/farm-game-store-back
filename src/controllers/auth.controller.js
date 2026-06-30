import { loginService } from "../services/auth.service.js";

export const loginController = async (req, res, next) => {
  try {
    const { token } = await loginService(req.body);
    return res.status(200).json({
      type: "Bearer",
      token,
    });
  } catch (error) {
    return next(error);
  }
};
