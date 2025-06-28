// GET /api/agencies/list
router.get('/list', async (req, res) => {
  try {
    const supabase = require('../supabaseClient');
    const { data, error } = await supabase
      .from('agencies')
      .select('id, name, wilaya, license_number, phone, logo_url, background_url, location_name, latitude, longitude, is_approved, created_at');
    if (error) {
      return res.status(500).json({ error: 'فشل جلب بيانات الوكالات' });
    }
    res.json({ agencies: data });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الوكالات' });
  }
});

const express = require('express');
const router = express.Router();


// POST /api/agencies/add
router.post('/add', async (req, res) => {
  const {
    name,
    email,
    password,
    wilaya,
    airports,
    license_number,
    phone,
    bank_account,
    logo_url,
    background_url,
    location_name,
    latitude,
    longitude
  } = req.body;

  if (!name || !email || !password || !wilaya || !airports || !license_number || !phone || !location_name || !latitude || !longitude) {
    return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة' });
  }

  try {
    // إنشاء مستخدم في supabase.auth
    const supabase = require('../supabaseClient');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (userError) {
      return res.status(400).json({ error: 'فشل إنشاء المستخدم', details: userError.message });
    }
    const userId = userData.user.id;
    // إضافة الوكالة في جدول agencies
    const { error: insertError } = await supabase
      .from('agencies')
      .insert({
        id: userId,
        name,
        wilaya,
        license_number,
        phone,
        bank_account,
        logo_url,
        background_url,
        location_name,
        latitude,
        longitude,
        is_approved: false
      });
    if (insertError) {
      return res.status(500).json({ error: 'فشل إضافة الوكالة في قاعدة البيانات' });
    }
    // إضافة المطارات المرتبطة بالوكالة
    for (const airport_id of airports) {
      await supabase.from('agency_airports').insert({ agency_id: userId, airport_id });
    }
    res.json({ message: 'تمت إضافة الوكالة بنجاح، في انتظار موافقة الإدارة' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة الوكالة' });
  }
});

// تفعيل وكالة (PATCH /api/agencies/approve/:id)
router.patch('/approve/:id', async (req, res) => {
  const agencyId = req.params.id;
  try {
    const supabase = require('../supabaseClient');
    const { error } = await supabase
      .from('agencies')
      .update({ is_approved: true })
      .eq('id', agencyId);
    if (error) {
      return res.status(500).json({ error: 'فشل تفعيل الوكالة' });
    }
    res.json({ message: 'تم تفعيل الوكالة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء تفعيل الوكالة' });
  }
});

// حذف وكالة (DELETE /api/agencies/delete/:id)
router.delete('/delete/:id', async (req, res) => {
  const agencyId = req.params.id;
  try {
    const supabase = require('../supabaseClient');
    // حذف الربط مع المطارات أولاً
    await supabase.from('agency_airports').delete().eq('agency_id', agencyId);
    // حذف الوكالة
    const { error } = await supabase
      .from('agencies')
      .delete()
      .eq('id', agencyId);
    if (error) {
      return res.status(500).json({ error: 'فشل حذف الوكالة' });
    }
    res.json({ message: 'تم حذف الوكالة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الوكالة' });
  }
});

module.exports = router;

