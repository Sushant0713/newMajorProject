import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      return cb(new Error('Only xlsx, xls or csv files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB safeguard
  }
});
