from apscheduler.schedulers.background import BackgroundScheduler
from urban_air_quality_digital_twin.run_agents import crew

def run_agents_workflow():
    print("Scheduled Run Started")
    crew.kickoff()

scheduler = BackgroundScheduler()
scheduler.add_job(run_agents_workflow, 'interval', minutes=60)
scheduler.start()
