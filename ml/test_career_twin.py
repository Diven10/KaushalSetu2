from career_twin import get_career_twin


# Use an existing trainee, occupation and job
TRAINEE_ID = 1
OCCUPATION_ID = 1
JOB_ID = 1


result = get_career_twin(
    trainee_id=TRAINEE_ID,
    occupation_id=OCCUPATION_ID,
    job_id=JOB_ID
)


print("\n================================")
print("       CAREER DIGITAL TWIN")
print("================================")


print("\nSTATUS:")
print(result["status"])


if result["status"] == "SUCCESS":

    print("\nTRAINEE:")
    print(result["trainee"]["full_name"])


    print("\nCAREER TARGET:")
    print(
        "Occupation ID:",
        result["career_target"]["occupation_id"]
    )

    print(
        "Job ID:",
        result["career_target"]["job_id"]
    )


    print("\nSKILL MATCH SCORE:")
    print(
        result["skill_analysis"]["skill_match_score"],
        "%"
    )


    print("\nSKILL GAPS:")

    for skill, gap in result["skill_analysis"]["skill_gaps"].items():

        print(
            f"• {skill} - "
            f"{gap['status']} - "
            f"Priority: {gap['priority']}"
        )


    print("\nREADINESS:")
    print(
        "Score:",
        result["readiness"]["readiness_score"]
    )

    print(
        "Level:",
        result["readiness"]["readiness_level"]
    )


    print("\nPLACEMENT:")

    if result["placement"] is not None:

        prediction = result["placement"]["prediction"]

        print(
            "Probability:",
            prediction["placement_percentage"],
            "%"
        )

        print(
            "Prediction:",
            prediction["prediction"]
        )

    else:

        print("Not available")


    print("\nEXPLAINABILITY:")

    explanation = result["explainability"]


    print("\nWHY:")

    if explanation.get("placement"):

        for reason in explanation["placement"]["why"]:
            print("•", reason)


    print("\nSKILL GAP ACTIONS:")

    for gap in explanation["skill_gaps"]:
        print(
            "→ Improve",
            gap["skill"],
            "proficiency."
        )


    print("\nWHAT NEXT:")

    for action in explanation["what_next"]:
        print("→", action)