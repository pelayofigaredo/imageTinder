using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.Text;

namespace ImageTinder
{
    public partial class Form1 : Form
    {
        List<string> images = new List<string>();
        int currentImageIndex = 0;

        string folderAPath;
        string folderBPath;

        bool folderASelected = false;
        bool folderBSelected = false;

        bool setNameFromMetadata = true;

        bool[] markedForDeletion;

        public Form1()
        {
            InitializeComponent();

            //Liste for arrow keys
        }

        static bool DeleteImage(string source)
        {
            try
            {
                File.Delete(source);
                return true;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error deleting file: " + ex.Message);
                return false;
            }
        }

        void DeleteMarkedImages()
        {
            List<string> imagesNEW = new List<string>();
            if (folderASelected && folderBSelected)
            {
                for (int i = 0; i < markedForDeletion.Length; i++)
                {
                    if (markedForDeletion[i])
                    {
                        DeleteImage(images[i]);
                    }
                    else
                    {
                        imagesNEW.Add(images[i]);
                    }
                }
                
            }
            SetImages(imagesNEW);
        }

        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (keyData == Keys.Left)
            {
                LeftArrow();
                return true;
            }
            if (keyData == Keys.Right)
            {
                RightArrow();
                return true;
            }
            return base.ProcessCmdKey(ref msg, keyData);
        }

        void LeftArrow()
        {
            if (!folderASelected || !folderBSelected)
                return;

            markedForDeletion[currentImageIndex] = true;
            SetImageIndex(currentImageIndex + 1);
        }

        void RightArrow()
        {
            if (!folderASelected || !folderBSelected)
                return;

            CopyImage(images[currentImageIndex]);
            SetImageIndex(currentImageIndex + 1);
        }

        void CopyImage(string source)
        {
            string fileName = Path.GetFileName(source);
            string dest = "";
            if(!setNameFromMetadata)
                dest = Path.Combine(folderBPath, fileName);
            else
            {
                //Get the date taken from the image
                string dateTaken = ""; GetDateTakenFromImage(source);
                if (dateTaken != null)
                {
                    dest = Path.Combine(folderBPath, dateTaken + "_" + fileName);
                }
                else
                {
                    dest = Path.Combine(folderBPath, fileName);
                }
            }
            File.Copy(source, dest);
        }

        private void GetDateTakenFromImage(string source)
        {
            var directories = ImageMetadataReader.ReadMetadata(source);
            foreach (var directory in directories)
                foreach (var tag in directory.Tags)
                    Console.WriteLine($"{directory.Name} - {tag.Name} = {tag.Description}");

            var subIfdDirectory = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
            var dateTime = subIfdDirectory?.GetDescription(ExifDirectoryBase.TagDateTime);
            Console.WriteLine(dateTime);
        }

        private void folderAbtn_Click(object sender, EventArgs e)
        {
            // Show the FolderBrowserDialog.
            DialogResult result = folderDialogA.ShowDialog();
            if (result == DialogResult.OK)
            {
                folderAPath = folderDialogA.SelectedPath;
                folderALabel.Text = folderAPath;
                folderASelected = true;
                          //Get all the images in the folder

                List<string> paths = new List<string>();
                images = System.IO.Directory.GetFiles(folderAPath, "*.jpg").ToList();
                images.AddRange(System.IO.Directory.GetFiles(folderAPath, "*.jpeg").ToList());
                images.AddRange(System.IO.Directory.GetFiles(folderAPath, "*.png").ToList());
                images.AddRange(System.IO.Directory.GetFiles(folderAPath, "*.gif").ToList());
                images.AddRange(System.IO.Directory.GetFiles(folderAPath, "*.bmp").ToList());
                images.AddRange(System.IO.Directory.GetFiles(folderAPath, "*.tif").ToList());
                if (images.Count > 0)
                {
                    SetImageIndex(0);
                }
                SetImages(paths);
            }
        }

        void SetImages(List<string> images)
        {
            this.images = images;
            markedForDeletion = new bool[images.Count];
            currentImageIndex = 0;
            if (images.Count > 0)
            {
                SetImageIndex(0);
            }
        }


        private void folderBbtn_Click(object sender, EventArgs e)
        {
            // Show the FolderBrowserDialog.
            DialogResult result = folderDialogB.ShowDialog();
            if (result == DialogResult.OK)
            {
                folderBPath = folderDialogB.SelectedPath;
                folderBLabel.Text = folderBPath;
                folderBSelected = true;
            }
        }

        void SetImageIndex(int index)
        {
            bool increasing = index > currentImageIndex;
            currentImageIndex = index;
            if (currentImageIndex < 0)
            {
                currentImageIndex = images.Count - 1;
                if(markedForDeletion[currentImageIndex])
                {
                    SetImageIndex( currentImageIndex-1);
                    return;
                }
            }

            if (currentImageIndex >= images.Count)
            {
                currentImageIndex = 0;
                if (markedForDeletion[currentImageIndex])
                {
                    SetImageIndex(currentImageIndex + 1);
                    return;
                }
            }

            pictureBox.ImageLocation = images[currentImageIndex];
        }

    }
}
