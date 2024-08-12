export const SWAGGER_API_ROOT = 'api/docs';
export const SWAGGER_API_NAME = 'Simple API';
export const SWAGGER_API_DESCRIPTION = 'Simple API Description';
export const SWAGGER_API_CURRENT_VERSION = '1.0';

//
export const UPDATE_SUCCESS = 'Update Successfully';
export const UPDATE_FAILED = 'Update Failed';
export const BAD_REQUEST = 'Bad Request';
export const CREATE_SUCCESS = 'Create Successfully';
export const CREATE_FAILED = 'Create failed';
export const UNAUTHORIZED = 'Unauthorized';
export const SUCCESSFULLY = 'Successfully';
export const DELETESUCCESS = 'Delete Successfully';
export const DELETEFAILED = 'Delete Failed';
export const LOGINSUCCESS = 'Login successfully';
export const RESPONE_SUCCESS = 'Successful Response';
export const REGISTER_SUCCESS = 'Successful Registration';
export const SUCCESS_TOKEN = 'Send OTP successfully';
export const LOGIN_SUCCESS = 'Successful Login';
export const RECORD_DATA_NULL = 'Record Date null';
export const BODY_NULL = 'Body null';
export const FAILED = 'Failed';


//messge user
export const CURRENT_PASSWORD_REQUIRED = 'Current password is required';
export const NEW_PASSWORD_REQUIRED = 'New password is required';
export const PASSWORD_SAME = 'Old password and new password must not be the same';
export const CURRENT_PASSWORD_INCORRECT = 'Current password is incorrect';
export const PASSWORD_CHARACTERS = 'Password must contain at least 8 characters';
export const PASSWORD_SPECIAL_CHARACTERS = 'Password must be a combination of alphabets, numbers and special characters';
export const PASSWORD_MORE2_CHARACTERS = 'Password must be a combining 2 or more types of alphabets, numbers, and special characters';
export const NEW_PASSWORD_NOT_OLD_PASSWORD = '사용 했던 비밀번호와 동일한 비밀번호를 사용할 수 없습니다.';
export const CHANGE_PASSWORD_SUCCESSFULLY = 'Change password successfully';
export const CHANGE_PASSWORD_FAILED = 'Change password failed';
export const USER_NOT_EXIST = 'User not exist';
export const USER_SETTING_TYPE_NULL = 'Setting type null';
export const ACCOUNT_NOT_MEMBER = 'Account not a member';
export const USER_EMAIL_EXIST = 'User Name, email or phone number is existed';
export const PHONE_EXIST = 'Phone number is existed';
export const USERNAME_EXIST = 'UserName is existed';
export const EMAIL_EXIST = 'Email is existed';
export const PROFILE_SUCCESS = 'Get Profile successfully';
export const POST_TOKEN_FAILED = 'post token fail';
export const LOGIN_FAILED = 'Login fail';
export const APPLEID_EXIST = 'AppleID is existed';


export const NOTICE_TYPE = 105; // sent token all user
export const STATUS_NOTICE = 2; //active

//sleep_start_alarm
export const NOTIFICATION_TYPE_SLEEP_START_ALARM = 'sleep start alarm';
export const NOTIFICATION_TYPE_SLEEP_START_ALARM_TITLE = '수면 시작 알람';
export const NOTIFICATION_TYPE_SLEEP_START_ALARM_CONTENT =
  '취침 준비 중 이신가요?';

//sleep_end_alarm 
export const NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION = 'sleep end alarm';
export const NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_TITLE = '수면 종료 알림';
export const NOTIFICATION_TYPE_SLEEP_END_NOTIFICATION_CONTENT =
  '아직 수면 중 이신가요?';

//marketing_alarm
export const NOTIFICATION_TYPE_MARKETING_ALARM = 'marketing alarm';

//NOTIFICATION_TYPE
export const NOTIFICATION_TYPE = Object.freeze({
  SleepEndAlarm: 'sleep_end_alarm',
  SleepStartAlarm: 'sleep_start_alarm',
  MarketingAlarm: 'marketing_alarm',
});
export const TOTAL_SCORE = 22;

export const NOTIFICATION_IS_DEVELOP = true;

export const COMMON_CODE = Object.freeze({
  UserStatus: 'user_status',
  RecordsType: 'records_type',
  EnvironmentType: 'environment_type',
  EnvironmentMobileType: 'environment_mobile_type',
  EnvironmentFitbitType: 'environment_fitbit_type',
  SleepType: 'sleep_type',
  SurveyType: 'survey_type',
  SurveyNameYesNo: 'survey_name_yes_no',
  SurveyNameLevel: 'survey_name_level',
  SurveyValueYesNo: 'survey_value_yes_no',
  SurveyValueLevel: 'survey_value_level',
});

export const USER_STATUS = Object.freeze({
  Active: 'active',
  Lock: 'lock',
  Inactive: 'inactive',
});

export const RECORDS_TYPE = Object.freeze({
  Daily: 'daily',
  Environment: 'environment',
  Sleep: 'sleep',
  Survey: 'survey',
});

//
export const RECORDS_TYPE_PARENT = Object.freeze({
  DailyRecord: 65,
  EnvironmentRecord: 66,
  SleepRecord: 67,
  SurveyRecord: 68,
});

//
export const RECORDS_TYPE_ID = Object.freeze({
  Alcohol: 73,
  Caffeine: 74,
  Nap: 75,
  Stress: 76,
});

export const ENVIRONMENT_RECORD_TYPE_ID = Object.freeze({
  mobile_step_status: 81,
  mobile_tem_status: 82,
  mobile_time_status: 83,
  fitbit_step_status: 85,
  fitbit_time_status: 86,
  fitbit_distance_status: 87,
  fitbit_heart_rate_status: 88,
  sleep_time_status: 91,
});

export const RECORDS_SLEEP_TYPE_FITBIT = Object.freeze({
  SleepTime: 94,
  NumberOfWakes: 95,
  TimeAwake: 96,
  StartTime: 114,
  EndTime: 115,
  SleepQuality: 116,
});

export const ENVIRONMENT_TYPE_ID = Object.freeze({
  Mobile: 78,
  Fitbit: 79,
});

export const STATUS_TYPE_VALUE = Object.freeze({
  Alcohol: 360,
  Caffeine: 355,
});
export const ENVIRONMENT_TYPE = Object.freeze({
  Mobile: 'mobile',
  Fitbit: 'fitbit',
});

export const ENVIRONMENT_FITBIT_TYPE = 84; //environment_fitbit_type

export const ENVIRONMENT_TYPE_VALUE = Object.freeze({
  TemperatureFrom: 16,
  TemperatureTo: 18,
  NumberOfStep: 3000,
  PhoneLog: 2,
  HeartRate: 100,
});
export const NAP_TIME_ID = Object.freeze({
  one_hour: 100, //1hour
  two_hour: 101, //2hour
  more_2hour: 102, //more_2hour
  more_than: 103, //more_than
});
export const TIME_ID = Object.freeze({
  morning: 9,
  afternoon: 10,
  before_going_to_bed: 25,
});
export const STRESS_ID = Object.freeze({
  weak: 15,
  usually: 16,
  strong: 21,
});
export const ENVIRONMENT_TYPE_DETAIL = Object.freeze({
  mobile_step: 'number_of_steps',
  mobile_tem: 'ambient_temperature',
  mobile_time: 'mobile_phone_log',

  fitbit_step: 'number_of_steps',
  fitbit_time: 'activity_time',
  fitbit_distance: 'distance_traveled',
  fitbit_heart_rate: 'heart_rate',
  sleep_score: 'sleep_score',
  sleep_stages: 'sleep_stages',
  sleep_time: 'sleep_time',
  nap_time: 'nap_time',
  un_known_time: 'un_known_time',
  awake_time: 'awake_time',
});
export const SLEEP_TYPE = Object.freeze({
  SleepTime: 'st_sleep_time',
  NumberOfWakes: 'st_number_of_wakes',
  TimeAwake: 'st_time_awake',
  StartTime: 'st_start_time',
  EndTime: 'st_end_time',
  SleepQuality: 'st_sleep_quality',
});
export const SURVEY_TYPE = Object.freeze({
  Yes_No: 'yes_no',
  Level: 'level',
});

export const TIME_VALUE = Object.freeze({
  before_going_to_bed: 'before going to bed',
  no_content_doc:
    '수면 가이드를 찾을 수 없습니다. 수면 기록이 누적될 수록 수면에 영향을 주는 요소를 찾을 확률이 높아집니다.',
});

export const SLEEP_TIP_TYPE = Object.freeze({
  sleep_tip_daily_record: 'sleep_tip_daily_record',
  sleep_tip_environment: 'sleep_tip_environment',
});
export const SLEEP_TIP = Object.freeze({
  tip_env_number_of_steps: 167,
  tip_env_phone_log: 168,
  tip_env_ambient_temperature: 169,
  tip_env_heart_rate: 170,

  tip_daily_alcohol_1: 172,
  tip_daily_alcohol_2: 173,
  tip_daily_cafe_1: 174,
  tip_daily_cafe_2: 175,
  tip_daily_nap_1: 176,
  tip_daily_nap_2: 177,
  tip_daily_stress: 178,
  tip_daily_sunlight_exposure: 179,
});

export const STATUS_RECORD = Object.freeze({
  Like: 70,
  UnLike: 71,
});

export const SLEEP_TIP_TYPE_ID = Object.freeze({
  sleep_tip_daily_record: 171,
  sleep_tip_environment: 166,
});

export const TYPEID_START_TIME = 114;
export const TYPEID_END_TIME = 115; 
export const START_NOTI_TEXT = "[SOMDAY] 수면시작 시간입니다! 수면기록을 시작  해 볼까요?";
export const END_NOTI_TEXT = "[SOMDAY] 수면종료 시간입니다! 수면기록을 완료  해 볼까요?";