import requests
import os
from datetime import datetime, timedelta
import time
import pytz
import csv


def download_csv(url, filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: {filename}")
        return True
    else:
        print(f"Failed to download: {url}")
        return False


def is_file_empty(filename):
    return os.path.getsize(filename) == 0


def is_file_complete(filename):
    try:
        with open(filename, 'r') as csvfile:
            csv_reader = csv.reader(csvfile)
            rows = list(csv_reader)
            return len(rows) > 1 and len(rows[0]) >= 4  # 检查是否至少有一个数据行和至少4列
    except:
        return False


def main():
    base_url = "https://block-rewards.io.solutions/block-workers/"
    csv_dir = "downloaded_csv"
    os.makedirs(csv_dir, exist_ok=True)

    utc_now = datetime.now(pytz.UTC)
    last_hour = utc_now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=1)

    for i in range(30 * 24):  # 30天 * 24小时
        file_datetime = last_hour - timedelta(hours=i)

        date = file_datetime.date()
        hour = file_datetime.hour

        csv_url = f"{base_url}csv/{date.strftime('%Y-%m-%d')}-{hour:02d}.csv"
        filename = f"{date.strftime('%Y-%m-%d')}-{hour:02d}-block-workers.csv"
        full_path = os.path.join(csv_dir, filename)

        if os.path.exists(full_path):
            if is_file_complete(full_path):
                print(f"Skipping existing complete file: {filename}")
                continue
            else:
                print(f"Existing file {filename} is incomplete. Re-downloading.")
                os.remove(full_path)

        success = download_csv(csv_url, full_path)
        if not success:
            print(f"No more files available before {file_datetime}")
            break

        if is_file_empty(full_path):
            print(f"Downloaded file {filename} is empty. Removing it.")
            os.remove(full_path)
            break

        time.sleep(1)  # 添加1秒延迟，避免请求过于频繁


if __name__ == "__main__":
    main()
