import pandas as pd

from ml.classification.classifier import classify_incident


# Load actual incident data
incidents = pd.read_csv("data/generated/incidents.csv")


# Classify every incident description
incidents["predicted_type"] = incidents["description"].apply(
    classify_incident
)


# Compare predicted type with existing type
incidents["correct"] = (
    incidents["predicted_type"] == incidents["type"]
)


print("\nCLASSIFICATION RESULTS")
print("----------------------")

print(
    incidents[
        [
            "incident_id",
            "description",
            "type",
            "predicted_type",
            "correct"
        ]
    ].head(20)
)

accuracy = incidents["correct"].mean()

print("\nClassification accuracy:", round(accuracy, 2))