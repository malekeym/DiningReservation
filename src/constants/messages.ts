const MESSAGES = {
  welcome: `👋🏻 سلام\nبه ربات رزرو خودکار غذا دانشگاهی خوش اومدی.\n\n🔻 یکی از دکمه های زیر را انتخاب کن.`,
  getUsername: '🧍🏻‍♂️ نام کاربری سایت رفاهی رو بفرست',
  getPassword: '🔓 حالا رمز سایت رفاهی رو بفرست ( رمز شما در این ربات ذخیره نمیشود )',
  reserve: 'رزرو غذا',
  back: '←',
  error: 'متوجه منظورت نشدم!\nلطفا از دکمه های ربات استفاده کن',
  letMeCheck: ' 🔎 درحال پردازش اطلاعات ...',
  wrongUsernamrOrPassword: '❌ *نام کاربری یا رمز رو اشتباه فرستادی*',
  showNextWeekReserveList: 'رزرو های هفته بعد',
  autoReserve: 'تنظیم رزرو خودکار',
  notFound: 'چیزی یافت نشد !',
  letMeSendSelfs: 'بزار لیست سلف ها رو برات بفرستم که انتخاب کنی...',
  letMeSendFoods: 'بزار لیست غذا هارو در بیارم ...',
  nextWeek: 'هفته بعد ⏪',
  selfName: '🍽️ نام سلف',
  foodName: '🍕 نام غذا',
  price: '💰 قیمت',
  date: '📅 تاریخ',
  currency: 'ریال',
  number: 'شماره',
  day: '📅 روز',
  notFoundFoodForThisWeek: 'متاسفم، برای این هفته غذایی پیدا نکردم، اگه میخوای میتونی با استفاده از دکمه زیر هفته بعد رو چک کنی...',
  sorryNotFoundAnyFood: 'متاسفم تو این هفته هم چیزی پیدا نکردم، میتونی بری به منو اصلی و از اونجا به قسمت کد فراموشی بری و ببینی غدایی هست یا نه',
  lostCode: 'کد فراموشی',
  getLostCode: 'دریافت کد فراموشی',
  shareLostCode: 'ارسال کد فراموشی',
  reportBadCode: 'گزارش کد فراموشی اشتباه',
  findFromBelow: '🔻 یکی از دکمه های زیر را انتخاب کن.',
  successFullLostCode: '✅ کد فراموشی به لیست اضافه شد\n',
  unSuccessFullLostCode:
    'یه مشکلی پیش اومده شاید غذات مشکل داره شایدم من مشکل دارم بهتره یه چک تو سایت کنی اگه به نظرت مشکل از منه به ادمین پیام بده',
  notFoundLostCode: 'با بچه های دانشکده تون صحبت کن بیان تو بات کد share کنن، متاسفم واقعا دنیا، دنیا بدی شده هیچ کدی ندارم باهات share کنم :(',
  successFullLostCodeGet: 'به به ماشالا به بچه های دانشکده تون که به فکر همدیگه ان بیا اینم کد نوش جونت یادت باشه بعدا جبران کنی برای بقیه :)))',
  supportLostCode: 'شماره کد اشتباه رو وارد کن تا پیگیری کنم',
  weWouldCheck: 'کد فراموشی غلط رو گرفتم. در اولین فرصت بررسی میکنم ...',
  mealType: 'وعده غذایی',
  setAutoReserve: 'تنظیم رزرو خودکار',
  reserveThisWeek: 'رزرو غذای این هفته',
  reserveNextWeek: 'رزرو غذای هفته بعد',
  changeSecondPass: 'تغییر رمز دوم',
  logout: 'خروج',
  login: 'تکمیل اطلاعات',
  aboutMessage: 'درباره ربات',
  supportMessage: 'پیام بفرست',
  supportMessageSent: 'ارسال شد',
  thisWeekReserves: 'رزرو های این هفته',
  nextWeekReserves: 'رزرو های هفته بعد',
  nextWeekFoods: 'غذا های هفته بعد',
  thisWeekFoods: 'غذا های این هفته',
  myInfo: 'اطلاعات من',
  myInfoMessage: 'اطلاعات شما :',
  about: 'درباره ربات',
  support: 'پشتیبانی',
  successFullyLogout: 'با موفقیت خارج شدید',
  unsuccessFullOperation: 'یه مشکلی پیش اومد',
  autoReserveStatus: '⚠️ وضعیت رزرو خودکار',
  active: '🟢 فعال',
  deActive: '🔴 غیر فعال',
  activeDays: '📅 روزهای فعال',
  noDay: 'هیچ روز',
  activateAutoReserve: 'فعال سازی رزرو خودکار',
  deActivateAutoReserve: 'غیرفعال سازی رزرو خودکار',
  changeAutoReserveDays: 'تغییر تنظیمات رزرو خودکار',
  activateSuccessFully: 'رزرو خودکار با موفقیت فعال شد',
  deActivateSuccessFully: 'رزرو خودکار غیر فعال شد',
  chooseDays: 'روزهای مدنظر خود را از منو زیر انتخاب کنید',
  isAdded: 'با موفقیت اضافه شد',
  isRemoved: 'حذف شد',
  showAutoReserveStatus: 'نمایش اطلاعات رزرو خودکار',
  youShouldLoginFirst: 'باید اول وارد شوید...',
};

export const DAYS = ['شنبه', 'یک شنبه', 'دو شنبه', 'سه شنبه', 'چهارشنبه', 'پنج شنبه', 'جمعه'];

export default MESSAGES;
