const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Notifica al evaluador cuando se le asigna un alumno
async function sendAssignmentEmail(evaluatorEmail, evaluatorName, studentName, company) {
  try {
    await transporter.sendMail({
      from: `"Gestión de Prácticas" <${process.env.EMAIL_USER}>`,
      to: evaluatorEmail,
      subject: "📍 Nueva Práctica Asignada para Evaluación",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Hola, ${evaluatorName}</h2>
          <p>Se te ha asignado formalmente como evaluador para el siguiente proceso:</p>
          <ul>
            <li><strong>Alumno:</strong> ${studentName}</li>
            <li><strong>Empresa:</strong> ${company}</li>
          </ul>
          <p>Por favor, ponte en contacto con el alumno para iniciar el proceso de seguimiento.</p>
          <hr />
          <p><small>Este es un correo automático, no lo respondas.</small></p>
        </div>
      `,
    });
    console.log(`Email enviado a ${evaluatorEmail}`);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}

module.exports = { sendAssignmentEmail };