async function updateStatus(req, res, next) {
  try {
    const { status, reviewId } = req.body;
    const foundReview = await Review.findOne({
      _id: reviewId,
      status: { $ne: status },
    });

    if (!foundReview) {
      return res.json({
        message: "Không thể cập nhật trạng thái đánh giá đã trình",
      });
    }

    const { dataReview, personalScore, organizationScore, bossScore } =
      foundReview;

    const dataReviewScoreOnly = dataReview.filter((dt) => dt.tt);

    if (!dataReview || !dataReview.length) {
      return res
        .status(400)
        .json({ message: "Chưa tồn tại điểm đánh giá trong bài đánh giá" });
    }

    if (status == 2) {
      const reviewerSetting = await userReviewByUserModel.findOne({
        type: 2,
        employeeIds: { $in: [foundReview.employeeId] },
      });

      if (!reviewerSetting) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy cấu hình người đánh giá" });
      }

      if (typeof personalScore !== "number") {
        return res
          .status(400)
          .json({ message: "Đồng chí chưa nhập điểm do cá nhân tự chấm" });
      }

      for (const dt of dataReview) {
        if (dt.tt) {
          dt.max = dt.max || 0;
          const check = validateScore(dt.max, dt.personalScore);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí nhập sai điểm hoặc chưa nhập điểm do cá nhân tự chấm",
              });
          }
        } else {
          const check = validateScore(dt.maxSum, dt.personalScoreSum);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí vui lòng kiểm tra lại điểm do cá nhân tự chấm",
              });
          }
        }
      }

      foundReview.approverOne = reviewerSetting.reviewerId;
    }

    if (status == 3) {
      const reviewerSetting = await userReviewByUserModel.findOne({
        type: 1,
        employeeIds: { $in: [foundReview.employeeId] },
      });

      if (!reviewerSetting) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy cấu hình người đánh giá" });
      }

      if (typeof organizationScore !== "number") {
        return res
          .status(400)
          .json({
            message:
              "Đồng chí chưa nhập điểm do cơ quan, tổ chức, đơn vị đánh giá",
          });
      }

      for (const dt of dataReview) {
        if (dt.tt) {
          dt.max = dt.max || 0;
          const check = validateScore(dt.max, dt.organizationScore);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí nhập sai điểm hoặc chưa nhập điểm do cơ quan, tổ chức, đơn vị đánh giá",
              });
          }
        } else {
          const check = validateScore(dt.maxSum, dt.organizationScoreSum);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí vui lòng kiểm tra lại điểm do cơ quan, tổ chức, đơn vị đánh giá",
              });
          }
        }
      }

      foundReview.approverTwo = reviewerSetting.reviewerId;
    }

    if (status == 4) {
      const reviewerSetting = await userReviewByUserModel.findOne({
        type: 1,
        employeeIds: { $in: [foundReview.employeeId] },
      });

      if (!reviewerSetting) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy cấu hình người đánh giá" });
      }

      if (typeof bossScore !== "number") {
        return res
          .status(400)
          .json({
            message:
              "Đồng chí chưa nhập điểm do Thủ trưởng cấp có thẩm quyền đánh giá",
          });
      }

      for (const dt of dataReview) {
        if (dt.tt) {
          dt.max = dt.max || 0;
          const check = validateScore(dt.max, dt.bossScore);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí nhập sai điểm hoặc chưa nhập điểm do Thủ trưởng cấp có thẩm quyền đánh giá",
              });
          }
        } else {
          const check = validateScore(dt.maxSum, dt.bossScoreSum);
          if (!check) {
            return res
              .status(400)
              .json({
                message:
                  "Đồng chí vui lòng kiểm tra lại điểm do Thủ trưởng cấp có thẩm quyền đánh giá",
              });
          }
        }
      }
    }

    foundReview.status = status;
    await foundReview.save();
    return res.json(foundReview);
  } catch (e) {
    next(e);
  }
}
