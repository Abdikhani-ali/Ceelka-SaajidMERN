import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    setting.companyName = req.body.companyName || setting.companyName;
    setting.companyLogo = req.body.companyLogo || setting.companyLogo;
    setting.companyAddress = req.body.companyAddress || setting.companyAddress;
    setting.phoneNumber = req.body.phoneNumber || setting.phoneNumber;
    setting.email = req.body.email || setting.email;
    setting.currency = req.body.currency || setting.currency;
    if (req.body.invoiceSettings) {
      setting.invoiceSettings.prefix = req.body.invoiceSettings.prefix || setting.invoiceSettings.prefix;
      setting.invoiceSettings.footerText = req.body.invoiceSettings.footerText || setting.invoiceSettings.footerText;
    }
    setting.theme = req.body.theme || setting.theme;

    const updatedSetting = await setting.save();
    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
