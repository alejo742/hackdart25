"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, redirect } from "next/navigation"
import { createSurvey } from "@/features/survey/services/createSurvey";
import { getUserId } from "@/features/auth/getUser";
import styles from "./page.module.css"
import FileInput from "@/shared/components/forms/FileInput";
import LoadingModal from "@/shared/components/LoaderModal";

const CATEGORY_IMAGES = [
  { label: "Business & Entrepreneurship",    img: "/business.png" },
  { label: "Creative & Design",              img: "/creative.png" },
  { label: "Technology & Innovation",         img: "/tech.png" },
  { label: "Social & Community",              img: "/social.png" },
  { label: "Health & Wellness",               img: "/health.png" },
  { label: "Environment & Sustainability",    img: "/env.png" },
]

export default function SurveyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  // Replace context with state variable
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch user ID when session is available
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        try {
          const id = await getUserId(session.user.email);
          setUserId(id);
        } catch (error) {
          console.error("Failed to fetch user ID:", error);
        }
      }
    };
    
    fetchUserId();
  }, [session]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [topic, setTopic] = useState("")
  const [objective, setObjective] = useState("");
  const [isModerated, setIsModerated] = useState(false);
  const [questions, setQuestions] = useState<string[]>([])
  const [errors, setErrors] = useState<{ topic?: string; objective?: string }>({});


  // cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // manual file upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSelectedFile(file || null)
    if (file) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setCategory("") // clear dropdown
    }
  }

  // preset attach
  function attachPreset(imgPath: string) {
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(imgPath)
  }

  // dynamic questions
  const addQuestion    = () => setQuestions((q) => [...q, ""])
  const removeQuestion = (i: number) => setQuestions((q) => q.filter((_,idx) => idx!==idx))
  const updateQuestion = (i: number, v: string) => setQuestions((q) => q.map((x,idx)=> idx===i?v:x))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsLoading(true);
  
    // Validate inputs
    const newErrors: { topic?: string; objective?: string } = {};
  
    if (!topic.trim()) {
      newErrors.topic = "Topic is required.";
    }
    if (!objective.trim()) {
      newErrors.objective = "Objective is required.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
  
    try {
      // Create the survey
      const result = await createSurvey(
        userId || "",
        topic, 
        objective,
        isModerated,
        questions,
        selectedFile,
        previewUrl
      );
      
      // Show success message
      alert("Survey created successfully!");
      
      // Use setTimeout to ensure the alert is seen before navigation
      // and to prevent race conditions
      setTimeout(() => {
        router.replace("/profile");
      }, 100);
      
    } catch (error) {
      // This will only run if createSurvey throws an error
      console.error("Failed to create survey:", error);
      alert("Failed to create survey.");
    }
    finally {
      setIsLoading(false);
    }
  }
  return (
    <main className={styles.container}>
      {isLoading && <LoadingModal isLoading/>}
      <h1 className={styles.title}>Create a survey</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {errors.objective && <p style={{ color: "red" }}>{errors.objective}</p>}

        {/* UPLOAD FIELD */}
        <FileInput
          id="header"
          label="Header Image (optional)"
          accept="image/*"
          onChange={handleFileChange}
          reference={fileInputRef}
        />

        {/* CATEGORY DROPDOWN */}
        <div className={styles.field}>
          <label htmlFor="category">Default Images (optional)</label>
          <select
            id="category"
            className={styles.categorySelect}
            value={category}
            onChange={(e) => {
              const img = e.target.value
              setCategory(img)
              if (img) attachPreset(img)
            }}
          >
            <option value="">— Pick a category —</option>
            {CATEGORY_IMAGES.map(({ label, img }) => (
              <option key={label} value={img}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* LIVE PREVIEW */}
        {previewUrl && (
          <div className={styles.headerPreview}>
            <img src={previewUrl} alt="Preview" className={styles.headerImg} />
          </div>
        )}

        {/* TOPIC */}
        <div className={styles.field}>
          <label htmlFor="topic">Topic <strong>*</strong></label>
          <input
            id="topic"
            type="text"
            placeholder="e.g. Customer Satisfaction"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        {/* OBJECTIVE */}
        <div className={styles.field}>
          <label htmlFor="objective">Objective <strong>*</strong></label>
          <input
            id="objective"
            type="text"
            placeholder="e.g. Measure support response time"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            required
          />
        </div>

        {/* DYNAMIC QUESTIONS */}
        <div className={styles.field}>
          <label>Specific Questions</label>
          {questions.map((q, idx) => (
            <div key={idx} className={styles.questionField}>
              <input
                type="text"
                placeholder={`Question ${idx + 1}`}
                value={q}
                onChange={(e) => updateQuestion(idx, e.target.value)}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeQuestion(idx)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.addBtn}
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>

        {/* MODERATION CHECKBOX */}
        <div className={styles.field}>
          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="isModerated"
              checked={isModerated}
              onChange={(e) => setIsModerated(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="isModerated" className={styles.checkboxLabel}>
              Require content moderation
            </label>
          </div>
          <p className={styles.fieldDescription}>
            When enabled, inappropriate content will be filtered out from responses
          </p>
        </div>

        <span className={styles.surveyCreateDisclaimer}>Note: you can always edit the generated survey in your profile</span>

        {/* SUBMIT */}
        <button type="submit" className={styles.button}>
          Create
        </button>
      </form>
    </main>
  )
}