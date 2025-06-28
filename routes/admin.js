// admin.js
// Routes for main admin authentication and management
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
  }
  try {
    // تسجيل الدخول عبر supabase.auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }
    // جلب بيانات المدير من جدول admins
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (adminError || !admin) {
      return res.status(403).json({ error: 'الحساب ليس مديرًا' });
    }
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token: data.session.access_token,
      admin: admin
    });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

module.exports = router;
// POST /api/admin/register (إنشاء مدير عام جديد)
router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'كل الحقول مطلوبة' });
  }
  try {
    // تحقق من عدم وجود مدير عام سابق
    const { data: admins, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('role', 'main');
    if (adminCheckError) {
      return res.status(500).json({ error: 'خطأ في التحقق من المديرين' });
    }
    if (admins && admins.length > 0) {
      return res.status(403).json({ error: 'يوجد مدير عام بالفعل' });
    }
    // إنشاء مستخدم في supabase.auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (userError) {
      return res.status(400).json({ error: 'فشل إنشاء المستخدم', details: userError.message });
    }
    const userId = userData.user.id;
    // إضافة المدير في جدول admins
    const { error: insertError } = await supabase
      .from('admins')
      .insert({
        id: userId,
        full_name,
        email,
        role: 'main',
        created_by: null,
        permissions: null
      });
    if (insertError) {
      return res.status(500).json({ error: 'فشل إضافة المدير في قاعدة البيانات' });
    }
    res.json({ message: 'تم إنشاء المدير العام بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدير' });
  }
});
