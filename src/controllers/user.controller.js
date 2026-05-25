import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, 'Error generating tokens');
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validate user details
    //check if user already exists : username or email
    //check for images, check for avatar
    //upload image to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token from response
    //check for user creation success, send response to frontend

    const { fullName, email, userName, password } = req.body;

    if (
        [fullName, email, userName, password].some(
            (field) => field?.trim() === ''
        )
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists');
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, 'Failed to upload avatar image');
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        userName: userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!createdUser) {
        throw new ApiError(500, 'Failed to create user');
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, 'User registered successfully', createdUser)
        );
});

const loginUser = asyncHandler(async (req, res) => {
    //req body se data
    //username or email
    //find the user
    //check password
    //generate access token and refresh token
    //send cookie

    const { email, userName, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, 'Email or username is required');
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (!user) {
        throw new ApiError(404, 'User not found with given email or username');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 'User logged in successfully', {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, 'User logged out successfully', {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookie.refreshToken ||
            req.body.refreshToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (!incomingRefreshToken) {
            throw new ApiError(400, 'Refresh token is required');
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(404, 'Invalid refresh token: user not found');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token does not match');
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(200, 'Access token refreshed successfully', {
                    accessToken,
                    refreshToken,
                })
            );
    } catch (err) {
        throw new ApiError(
            401,
            err?.message || 'Invalid or expired refresh token'
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, 'Old password and new password are required');
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, 'Old password is incorrect');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, 'Password changed successfully', {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, 'Current user fetched successfully', req.user)
        );
});

const updateAccountDetails = asynchandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError('Both fullName and Email Required');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
            },
        },
        {
            new: true,
        }
    ).select('-password -refreshToken');

    return res
        .status(200)
        .json(new ApiResponse(200, 'Account Details Updated', user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, 'Error while uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        }
    ).select('-password -refreshToken');

    return res
        .status(200)
        .json(new ApiResponse(200, 'Avatar updated successfully', user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image is required');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, 'Error while uploading cover image');
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        }
    ).select('-password -refreshToken');

    return res
        .status(200)
        .json(new ApiResponse(200, 'Cover image updated successfully', user));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params;

    if (!userName?.trim()) {
        throw new ApiError(400, 'Username is required');
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
            },
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo',
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: '$subscribers',
                },
                subscribedToCount: {
                    $size: '$subscribedTo',
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, 'Channel not found');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                'Channel profile fetched successfully',
                channel[0]
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner',
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                'Watch history fetched successfully',
                user[0].watchHistory
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
