import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //yehi file name hai jo cloudinary ko milega
  }
})

export const upload = multer({
     storage,
     })
