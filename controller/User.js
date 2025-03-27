

export const Register=(req,res)=>{
try {
    if (!req.file) {
        // No file was uploaded
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = req.file.path;
      console.log(fileUrl)
} catch (error) {
    
}
}