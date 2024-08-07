import csv
import requests
from collections import defaultdict
import json
from datetime import datetime
import os


def process_csv_file(csv_file):
    rewards_per_unit = defaultdict(lambda: defaultdict(float))
    model_count = defaultdict(lambda: defaultdict(int))

    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)  # Skip header
        for row in csv_reader:
            if len(row) < 15:
                continue

            connectivity = row[7].lower()
            if connectivity not in ["high speed", "ultra high speed"]:
                continue

            processor = row[8].lower()
            try:
                quantity = float(row[9])
                rewarded = float(row[13])
            except ValueError:
                continue

            if quantity > 0 and rewarded > 0:
                reward_per_unit = rewarded / quantity
                rewards_per_unit[processor][connectivity] += reward_per_unit
                model_count[processor][connectivity] += 1

    average_rewards = {}
    for processor in rewards_per_unit:
        high_speed = rewards_per_unit[processor]["high speed"] / model_count[processor]["high speed"] if \
            model_count[processor]["high speed"] > 0 else 0
        ultra_high_speed = rewards_per_unit[processor]["ultra high speed"] / model_count[processor][
            "ultra high speed"] if model_count[processor]["ultra high speed"] > 0 else 0
        average = (high_speed + ultra_high_speed) / 2 if high_speed > 0 and ultra_high_speed > 0 else max(high_speed,
                                                                                                          ultra_high_speed)
        if average > 0:
            average_rewards[processor] = average

    sorted_rewards = sorted(average_rewards.items(), key=lambda x: x[1], reverse=True)
    return [{"name": name, "reward": reward} for name, reward in sorted_rewards]


def process_all_csv_files(directory):
    all_data = []
    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            file_path = os.path.join(directory, filename)
            try:
                # 从文件名中提取日期和小时
                date_parts = filename.split('-')
                date_str = '-'.join(date_parts[0:3])  # YYYY-MM-DD
                hour_str = date_parts[3]  # HH

                # 将日期和小时组合成一个完整的日期时间字符串
                datetime_str = f"{date_str}T{hour_str}:00:00"

                # 解析日期时间字符串
                date_time = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M:%S')

                # 转换为ISO格式
                iso_date_time = date_time.isoformat()
            except:
                # 如果解析失败，使用当前时间
                iso_date_time = datetime.now().isoformat()

            processors = process_csv_file(file_path)
            all_data.append({
                "datetime": iso_date_time,
                "processors": processors
            })
    return all_data


def get_io_price():
    url = "https://api.binance.com/api/v3/ticker/price"
    params = {
    "symbol": "IOUSDT"
    }
    response = requests.get(url, params=params)
    data = response.json()
    return float(data['price'])

def get_usd_cny_rate():
    response = requests.get('https://api.exchangerate-api.com/v4/latest/USD')
    data = response.json()
    return data['rates']['CNY']

def update_cloudflare_kv(account_id, namespace_id, email, api_key, key, value):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{namespace_id}/values/{key}"
    headers = {
    "X-Auth-Email": email,
    "X-Auth-Key": api_key,
    "Content-Type": "application/json"
    }
    response = requests.put(url, headers=headers, data=json.dumps(value))
    return response.json()

# ... (其他函数保持不变)

if __name__ == "__main__":
    # Process all CSV files in the directory
    csv_directory = r"A:\reactapp2\my-app\src\scripts\downloaded_csv"
    all_processor_data = process_all_csv_files(csv_directory)

    # Get current prices
    io_price = get_io_price()
    usd_cny_rate = get_usd_cny_rate()

    # Prepare data for KV storage
    kv_data = {
        "processorData": all_processor_data,
        "ioPrice": io_price,
        "usdCnyRate": usd_cny_rate,
        "lastUpdated": datetime.now().isoformat()
    }

    # Update Cloudflare KV
    account_id = "046dae1833853835a6a82db5712a545c"
    namespace_id = "cdc0fef918994a939fae5c6fad080918"
    email = "abcdjza@163.com"
    api_key = "5f719c15bcb6cfbe6a2de1e503769565cf23d"

    result = update_cloudflare_kv(account_id, namespace_id, email, api_key, "trend", kv_data)
    print("KV update result:", result)
