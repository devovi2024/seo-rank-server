import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recommendation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const keywordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    density: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    categories: {
      seo: {
        type: Number,
        default: 0,
      },
      performance: {
        type: Number,
        default: 0,
      },
      accessibility: {
        type: Number,
        default: 0,
      },
      bestPractices: {
        type: Number,
        default: 0,
      },
    },

    metaData: {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      canonical: {
        type: String,
        default: "",
      },
      robots: {
        type: String,
        default: "",
      },
      ogTitle: {
        type: String,
        default: "",
      },
      ogDescription: {
        type: String,
        default: "",
      },
      ogImage: {
        type: String,
        default: "",
      },
      twitterCard: {
        type: String,
        default: "",
      },
      viewport: {
        type: String,
        default: "",
      },
      charset: {
        type: String,
        default: "",
      },
    },

    headings: {
      h1: {
        type: Number,
        default: 0,
      },
      h2: {
        type: Number,
        default: 0,
      },
      h3: {
        type: Number,
        default: 0,
      },
      h4: {
        type: Number,
        default: 0,
      },
      h5: {
        type: Number,
        default: 0,
      },
      h6: {
        type: Number,
        default: 0,
      },

      h1Texts: {
        type: [String],
        default: [],
      },
    },

    links: {
      internal: {
        type: Number,
        default: 0,
      },
      external: {
        type: Number,
        default: 0,
      },
      broken: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },

    images: {
      total: {
        type: Number,
        default: 0,
      },
      missingAlt: {
        type: Number,
        default: 0,
      },
      withAlt: {
        type: Number,
        default: 0,
      },
    },

    keywords: {
      type: [keywordSchema],
      default: [],
    },

    issues: {
      type: [issueSchema],
      default: [],
    },

    loadTime: {
      type: Number,
      default: 0,
    },

    pageSize: {
      type: Number,
      default: 0,
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

analysisSchema.index({
  userId: 1,
  createdAt: -1,
});

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;