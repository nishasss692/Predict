from ml.recommendation.recommendation import generate_recommendation


root_cause = "Possible drainage blockage/overflow"
priority = "high"

recommendation = generate_recommendation(
    root_cause,
    priority
)

print("RECOMMENDATION")
print("--------------")
print(recommendation)