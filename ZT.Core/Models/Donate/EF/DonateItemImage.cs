﻿using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonateItemImage
    {
        public int ItemImageID { get; set; }
        public byte[] ImageData { get; set; }
        public int ItemID { get; set; }
    }
}
