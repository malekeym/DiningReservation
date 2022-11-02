const MESSAGES = {
  welcome: ({ name }: { name }) =>
    `👋🏻 سلام *${name}*\n🔸 به *ربات رزرو غذا دانشگاهی* خوش اومدی\n\n🔻  برای استفاده از ربات یکی از دکمه های زیر رو انتخاب کن`,
  getUsername: '🧍🏻‍♂️ *نام کاربری* سماد رو بفرست',
  getPassword: `🔓 حالا *رمز عبور* سماد رو بفرست ( رمزت تو این ربات ذخیره نمیشه )
  📌 *توجه* : کدملی شما معمولا رمز عبور سماد شماست`,
  reserve: 'رزرو غذا',
  back: '← بازگشت به منوی اصلی',
  error: '❌ *متوجه منظورت نشدم!*\n🔻 لطفا از دکمه های ربات استفاده کن',
  letMeCheck: ' 🔎 درحال پردازش اطلاعات ...',
  wrongUsernamrOrPassword: '❌ *نام کاربری یا رمز رو اشتباه فرستادی*',
  autoReserve: 'تنظیم رزرو خودکار',
  notFound: 'چیزی یافت نشد !',
  letMeSendSelfs: 'بزار لیست سلف ها رو برات بفرستم که انتخاب کنی ...',
  letMeSendFoods: 'بزار لیست غذا هارو در بیارم ...',
  nextWeek: 'هفته بعد ⏪',
  selfName: '🍽️ نام سلف',
  thisWeekReservesList: '🍟 *لیست رزرو های این هفته* :\n\n',
  nextWeekReservesList: '🍟 *لیست رزرو های هفته بعد* :\n\n',
  foodName: '🍕 نام غذا',
  price: '💳 قیمت',
  date: '📅 تاریخ',
  currency: 'ریال',
  number: 'شماره',
  day: '📅 روز',
  notFoundFoodForThisWeek: '💢 *متاسفم*، برای این هفته غذایی پیدا نکردم، اگه میخوای میتونی با استفاده از دکمه زیر هفته بعد رو چک کنی ...',
  sorryNotFoundAnyFood:
    '💢 *متاسفم*، تو این هفته هم چیزی پیدا نکردم، میتونی بری به منو اصلی و از اونجا به قسمت کد فراموشی بری و ببینی غدایی هست یا نه.',
  lostCode: 'کد فراموشی(آزمایشی)',
  getLostCode: 'دریافت کد فراموشی',
  shareLostCode: 'ارسال کد فراموشی',
  reportBadCode: 'گزارش کد فراموشی اشتباه',
  findFromBelow: '🔻 یکی از دکمه های زیر را انتخاب کن.',
  successFullLostCode: '✅ *کد فراموشی به لیست اضافه شد*\n',
  unSuccessFullLostCode:
    '❌ *یه مشکلی پیش اومده *\n🔻 شاید غذات مشکل داره شایدم من مشکل دارم بهتره یه چک تو سایت کنی اگه به نظرت مشکل از منه به پشتیبانی پیام بده',
  notFoundLostCode: '😔 با بچه های دانشکده تون صحبت کن بیان تو بات کد share کنن، متاسفم واقعا دنیا، دنیا بدی شده هیچ کدی ندارم باهات share کنم :(',
  successFullLostCodeGet: '✅ به به ماشالا به بچه های دانشکده تون که به فکر همدیگه ان بیا اینم کد نوش جونت یادت باشه بعدا جبران کنی برای بقیه :)))',
  supportLostCode: '🔻 شماره کد *اشتباه* رو وارد کن تا پیگیری کنم',
  weWouldCheck: '👍 کد فراموشی غلط رو گرفتم.\\ در اولین فرصت بررسی میکنیم ...',
  mealType: 'وعده غذایی',
  setAutoReserve: 'تنظیم رزرو خودکار',
  reserveThisWeek: 'رزرو غذای این هفته',
  reserveNextWeek: 'رزرو غذای هفته بعد',
  changeSecondPass: 'تغییر رمز دوم',
  logout: 'خروج',
  login: 'ورود به حساب کاربری',
  supportMessage: 'پیام بفرست',
  supportMessageSent: 'ارسال شد',
  thisWeekReserves: 'لیست رزرو های این هفته',
  nextWeekReserves: 'لیست رزرو های هفته بعد',
  nextWeekFoods: 'غذا های هفته بعد',
  thisWeekFoods: 'غذا های این هفته',
  myInfo: 'اطلاعات من',
  myInfoMessage: ({ name, uniName, id, username, credit, lastName }: { name; uniName; id; username; credit; lastName }) =>
    `🍔 *اطلاعات شما*
• نام: *${name} ${lastName}*
• نام دانشگاه: *${uniName}*
• موجودی حساب: *${credit / 10}* تومان
• ایدی: *${id}*
• یوزرنیم: *${username}*`,
  about: 'درباره ربات',
  aboutMessage:
    '💡 *درباره ربات*\n🔸 این ربات توسط دانشجویان دانشگاه خواجه نصیر طراحی شده و هدف فقط راحتی دانشجویان برای کار با سامانه سماد دانشگاهی می باشد.\n❤️ ارتباط با ما :\n• @Ghanbari\\_Matin\n• @Malekeym\n⭐️ لطفا برای حمایت از ما برید و به این پروژه استار بدید\n• https://github.com/malekeym/DiningReservation',
  support: 'پشتیبانی',
  successFullyLogout: 'با موفقیت خارج شدید',
  unsuccessFullOperation: 'یه مشکلی پیش اومد',
  autoReserveStatus: '🔸 *وضعیت رزرو خودکار*',
  active: '✅ فعال',
  deActive: '❌ غیر فعال',
  activeDays: '📅 *روزهای فعال*',
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
  youShouldLoginFirst: 'باید اول وارد شوید ...',
  noReserve: 'رزروی وجود ندارد',
  getUniversity: '🏫 *اسم دانشگاهت *رو انتخاب کن',
  notFoundProgram: 'سلف برای امروز هیچ برنامه غذایی ندارد',
  help: `
  🍟 ربات رزرو غذا دانشگاهی

🌮 برای رزرو غذا از منوی رزرو غذا این هفته و یا هفته بعد رو انتخاب کن بعد اسم سلف مورد نظرت رو انتخاب کن تا لیست غذاهای موجود رو ببینی
حالا با کلیک روی دکمه هر غذا در صورت داشتن موجودی کافی رزرو در لحظه انجام میشه و اگر موجودیت کافی نباشه بات پیام عدم موجودی کافی رو برات ارسال میکنه. 
رزرو غدا *فوری* هستش یعنی درجا یا برات رزرو میکنه یا بهت ارور مربوطه رو نشون میده
🍖 همچنین برای دیدن لیست غذا های رزرو شده با کلیک روی لیست رزرو های این هفته و یا هفته بعد میتونی لیست کامل غذاهای رزرو شده ات رو ببینی. 

🦠 اگر مشکلی تو بات دیدی از طریق ایدی هایی که تو قسمت درباره هست مشکلت رو برامون ارسال کن تا درستش کنیم.

👥 در آخر با معرفی این ربات به دوستات میتونی خیلی به ما در توسعه ربات کمک کنی`,
  notAvailable:
    'این بخش به علت تغییرات سیستم در دسترس نیست اما شما میتوانید با مراجعه به قسمت رزرو غدا به راحتی و در لحظه غذای مورد نظرتان را رزرو کنید',
  tag: '\n\n🍟 URB: @University\\_Reservation\\_Bot',
};

export const DAYS = ['شنبه', 'یک شنبه', 'دو شنبه', 'سه شنبه', 'چهارشنبه', 'پنج شنبه', 'جمعه'];

export const UNIVERSITIES = {
  3: 'دانشگاه شهید بهشتی (آزمایشی)',
  6: 'دانشگاه صنعتی امیرکبیر (آزمایشی)',
  7: 'دانشگاه صنعتی شریف (آزمایشی)',
  8: 'دانشگاه خواجه نصیرالدین طوسی',
};

export default MESSAGES;
