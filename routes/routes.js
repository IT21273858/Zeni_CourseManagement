var express = require('express');

const router = express.Router();
const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient();



// Course creation
router.route('/course/create').post((req, res) => {

    try {
        const courseData = {
            c_name: req.body.c_name,
            c_description: req.body.c_description,
            c_credits: req.body.c_credits,
            c_thumbnail: req.body.c_thumbnail,
            classification: req.body.classification,
            visibility: false,
            c_InstructorId: req.body.c_InstructorId,
        };
        prisma.course.create({ data: courseData }).then((course) => {
            console.log("Course created:", course);
            res.status(201).json({ status: true, message: `Course created successfully`, data: course.id, code: "201" });
        }).catch((er) => {
            console.log("Error while updating courseId in Module", er);
        })

    } catch (courseError) {
        console.error("Error creating course:", courseError);
        res.status(500).json({ status: false, message: "New Course cannot be created", code: "500" });
    };
});

// Module creation
router.route('/module/create').post((req, res) => {

    try {
        const moduleData = {
            m_name: req.body.m_name,
            m_description: req.body.m_description,
            m_type: req.body.m_type,
            courseId: req.body.courseId,
        };
        prisma.module.create({ data: moduleData }).then((module) => {
            console.log("Module created sucessfully");
            res.status(200).json({ status: true, data: module.id, message: "Module Created sucessfully" })
        }).catch((err) => {
            console.log("Error while creating module", err);
        })

    } catch (courseError) {
        console.error("Error creating module:", courseError);
        res.status(500).json({ status: false, message: "New Module cannot be created", code: "500" });
    };


    // const resourceData = {
    //     r_name: req.body.r_name,
    //     url: req.body.url,
    //     type: req.body.type,
    //     moduleId: "663abb6d3ef1eeb3638be0f0"
    // };

});

// Resource creation
router.route('/resources/create').post((req, res) => {

    try {
        const resourceData = {
            r_name: req.body.r_name,
            url: req.body.url,
            type: req.body.type,
            moduleId: req.body.moduleId
        };

        prisma.resources.create({ data: resourceData }).then(() => {
            console.log("Resources created sucessfully");
        }).catch((err) => {
            console.log("Error while creating resources", err);
        })

    } catch (courseError) {
        console.error("Error creating resources:", courseError);
        res.status(500).json({ status: false, message: "New Resource cannot be created", code: "500" });
    };

});

// Module update
router.route('/module/update').patch((req, res) => {

    try {
        const moduleData = {
            m_name: req.body.m_name,
            m_description: req.body.m_description,
            m_type: req.body.m_type,
            courseId: req.body.courseId
        }
        prisma.module.update({
            where: {
                id: req.body.moduleId
            },
            data: moduleData
        }).then((result) => {
            res.status(200).json({ status: true, module: result.id, message: "Module Updated Sucessfully" })
        }).catch((err) => {
            console.log("Error while updating module", err);
        })
    } catch (moduleError) {
        console.error("Error in updating modules:", moduleError);
        res.status(500).json({ status: false, message: "Error in updating module", code: "500" });
    };

});

// Get All Courses
router.route('/course/getAll').get((req, res) => {
    try {
        prisma.course.findMany({
            include: {
                module: {
                    include: {
                        resources: true
                    }
                },
                feedback: true,
                payment: true,
                enrollment: true
            }
        }).then((data) => {
            res.status(200)
                .json({ status: true, message: "Courses retrieved successful", data, code: "200" });
        })

    } catch (error) {
        console.error("Error finding courses:", error);
        res.status(500).json({ status: false, message: "Internal Server Error", code: 500 });
    }
})


// Function for Retreive only the specific course based on the id
router.route('/course/get/:id').get((req, res) => {
    const _id = req.params.id
    try {
        prisma.course.findUnique({
            where: {
                id: _id,
            },
            include: {
                module: {
                    include: {
                        resources: true
                    }
                },
                feedback: true,
                payment: true,
                enrollment: true
            }
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Course found", course: data, code: "200" })
            } else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error while fetching course", code: "500" });
        console.log("Error while fetching course", error);
    }
});

// Update course details

router.route('/course/update/:id').patch((req, res) => {
    const _id = req.params.id
    const courseData = {
        c_name: req.body.c_name,
        c_description: req.body.c_description,
        c_credits:req.body.c_credits,
        c_thumbnail: req.body.c_thumbnail,
        classification: req.body.classification,
        visibility: false,
    };

    try {
        prisma.course.update({
            where: {
                id: _id
            },
            data: courseData
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Course Updated Sucessfully", data: data, code: "200" })
            }
            else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" })
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: "Error occured while updating Course", code: "500" })
    }
});

// Add feedback
router.route('/course/feedback/create/:id').post((req, res) => {
    const _id = req.params.id
    const feedbacks = {
        feedback: req.body.feedback,
        userId: req.body.userId,
        courseId: _id
    };

    try {
        prisma.feedback.create({ data: feedbacks }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Feedback added Sucessfully", data: data, code: "200" })
            }
            else {
                res.status(404).json({ status: false, message: "Feedback not found", code: "404" })
            }
        })
    } catch (error) {
        res.status(500).json({ status: false, message: "Error occured while adding feedback", code: "500" })
    }
});

router.route('/course/delete/:id').delete((req, res) => {
    const _id = req.params.id

    try {

        prisma.course.delete({
            where: {
                id: _id,
            },
        }).then((data) => {
            if (data) {
                res.status(200).json({ status: true, message: "Course deleted", code: "200" })
            } else {
                res.status(404).json({ status: false, message: "Course not found", code: "404" });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Error while deleting course", code: "500" });
        console.log("Error while deleting course", error);
    }
});

module.exports = router;