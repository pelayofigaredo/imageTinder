namespace ImageTinder
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            folderDialogA = new FolderBrowserDialog();
            folderDialogB = new FolderBrowserDialog();
            mainPanel = new Panel();
            imagePanel = new Panel();
            folderAbtn = new Button();
            folderBbtn = new Button();
            folderALabel = new Label();
            folderBLabel = new Label();
            controlPanel = new Panel();
            folderAPanel = new SplitContainer();
            mainPanel.SuspendLayout();
            controlPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)folderAPanel).BeginInit();
            folderAPanel.SuspendLayout();
            SuspendLayout();
            // 
            // mainPanel
            // 
            mainPanel.AutoSize = true;
            mainPanel.Controls.Add(imagePanel);
            mainPanel.Controls.Add(folderAbtn);
            mainPanel.Controls.Add(folderBbtn);
            mainPanel.Controls.Add(folderALabel);
            mainPanel.Controls.Add(folderBLabel);
            mainPanel.Controls.Add(controlPanel);
            mainPanel.Dock = DockStyle.Fill;
            mainPanel.Location = new Point(0, 0);
            mainPanel.Name = "mainPanel";
            mainPanel.Padding = new Padding(4);
            mainPanel.Size = new Size(1136, 753);
            mainPanel.TabIndex = 0;
            // 
            // imagePanel
            // 
            imagePanel.Location = new Point(4, 109);
            imagePanel.Name = "imagePanel";
            imagePanel.Size = new Size(1128, 640);
            imagePanel.TabIndex = 5;

            // Habilitar DoubleBuffered para evitar parpadeos
            typeof(Panel).GetProperty("DoubleBuffered", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)
                ?.SetValue(imagePanel, true, null);

            // Asignar eventos
            imagePanel.Paint += ImagePanel_Paint;
            imagePanel.MouseWheel += ImagePanel_MouseWheel;
            imagePanel.MouseDown += ImagePanel_MouseDown;
            imagePanel.MouseMove += ImagePanel_MouseMove;
            // 
            // folderAbtn
            // 
            folderAbtn.Font = new Font("Segoe UI", 12F);
            folderAbtn.Location = new Point(12, 9);
            folderAbtn.Name = "folderAbtn";
            folderAbtn.Size = new Size(215, 44);
            folderAbtn.TabIndex = 2;
            folderAbtn.Text = "Carpeta de origen";
            folderAbtn.UseVisualStyleBackColor = true;
            folderAbtn.Click += folderAbtn_Click;
            // 
            // folderBbtn
            // 
            folderBbtn.Font = new Font("Segoe UI", 12F);
            folderBbtn.Location = new Point(12, 59);
            folderBbtn.Name = "folderBbtn";
            folderBbtn.Size = new Size(215, 44);
            folderBbtn.TabIndex = 3;
            folderBbtn.Text = "Carpeta de destino";
            folderBbtn.UseVisualStyleBackColor = true;
            folderBbtn.Click += folderBbtn_Click;
            // 
            // folderALabel
            // 
            folderALabel.AutoSize = true;
            folderALabel.FlatStyle = FlatStyle.Popup;
            folderALabel.Font = new Font("Segoe UI", 12F);
            folderALabel.Location = new Point(233, 21);
            folderALabel.Name = "folderALabel";
            folderALabel.Size = new Size(208, 21);
            folderALabel.TabIndex = 0;
            folderALabel.Text = "Selecciona carpeta de origen";
            folderALabel.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // folderBLabel
            // 
            folderBLabel.AutoSize = true;
            folderBLabel.FlatStyle = FlatStyle.Popup;
            folderBLabel.Font = new Font("Segoe UI", 12F);
            folderBLabel.Location = new Point(233, 71);
            folderBLabel.Name = "folderBLabel";
            folderBLabel.Size = new Size(214, 21);
            folderBLabel.TabIndex = 4;
            folderBLabel.Text = "Selecciona carpeta de destino";
            folderBLabel.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // controlPanel
            // 
            controlPanel.AutoSize = true;
            controlPanel.BackColor = SystemColors.ControlDark;
            controlPanel.Controls.Add(folderAPanel);
            controlPanel.Dock = DockStyle.Top;
            controlPanel.Location = new Point(4, 4);
            controlPanel.Name = "controlPanel";
            controlPanel.Size = new Size(1128, 0);
            controlPanel.TabIndex = 0;
            // 
            // folderAPanel
            // 
            folderAPanel.Dock = DockStyle.Fill;
            folderAPanel.Location = new Point(0, 0);
            folderAPanel.Name = "folderAPanel";
            folderAPanel.Size = new Size(1128, 0);
            folderAPanel.SplitterDistance = 376;
            folderAPanel.TabIndex = 1;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1136, 753);
            Controls.Add(mainPanel);
            Name = "Form1";
            Text = "Form1";
            mainPanel.ResumeLayout(false);
            mainPanel.PerformLayout();
            controlPanel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)folderAPanel).EndInit();
            folderAPanel.ResumeLayout(false);
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private FolderBrowserDialog folderDialogA;
        private FolderBrowserDialog folderDialogB;
        private Panel mainPanel;
        private Panel controlPanel;
        private SplitContainer folderAPanel;
        private Label folderALabel;
        private Button folderAbtn;
        private Button folderBbtn;
        private Label folderBLabel;
        private Panel imagePanel;
    }
}
