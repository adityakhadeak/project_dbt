import feeModel from "../models/feeModel.js";

export const addFee = async (req, res) => {
    try {
        const {firstYear,secondYear,thirdYear,fourthYear}=req.body
        const fee=new feeModel({
            "First Year":firstYear,
            "Second Year":secondYear,
            "Third Year":thirdYear,
            "Fourth Year":fourthYear
        })

        await fee.save()
        res.status(201).json({
            success: true,
            message: "Fee details added successfully",
            fee
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateFee = async (req, res) => {
    try {
        const feeId = req.body.id;
        const { firstYear, secondYear, thirdYear, fourthYear } = req.body;

        // Find the fee document by ID and update it
        const updatedFee = await feeModel.findByIdAndUpdate(
            feeId,
            {
                "First Year": firstYear,
                "Second Year": secondYear,
                "Third Year": thirdYear,
                "Fourth Year": fourthYear
            },
            { new: true } // This option returns the modified document rather than the original
        );

        // If the fee document is not found, return an error response
        if (!updatedFee) {
            return res.status(404).json({
                success: false,
                message: "Fee details not found"
            });
        }

        // Send success response
        res.status(200).json({
            success: true,
            message: "Fee details updated successfully",
            fee: updatedFee
        });
    } catch (error) {
        console.error(error.message);

        // Send error response
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

