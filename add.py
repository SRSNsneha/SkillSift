import pandas as pd
new_skills= [] #add new skills to add in the csv file here.

# Load existing CSV
df = pd.read_csv("skills_dataset.csv")

# Create a DataFrame for new skills
new_df = pd.DataFrame({"Skill": new_skills})

# Combine and drop duplicates
updated_df = pd.concat([df, new_df]).drop_duplicates().reset_index(drop=True)

# Save back to CSV
updated_df.to_csv("skills_dataset.csv", index=False)

print("✅ Skills added successfully!")


# Load the CSV
df = pd.read_csv("skills_dataset.csv", encoding="utf-8")

# Clean and standardize
df["Skill"] = df["Skill"].astype(str).str.strip().str.lower()
df = df[df["Skill"] != ""]  # Remove empty rows
df = df.drop_duplicates()    # Remove duplicates

# Save the cleaned version
df.to_csv("skills_dataset.csv", index=False)

print(f"✅ Cleaned CSV saved. Total unique skills: {len(df)}")

