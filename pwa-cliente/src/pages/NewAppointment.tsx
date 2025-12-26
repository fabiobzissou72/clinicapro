import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proceduresAPI, appointmentsAPI } from '../services/api';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

export default function NewAppointment() {
  const [step, setStep] = useState(1);
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    const response = await proceduresAPI.list();
    setProcedures(response.data.procedures);
  };

  const loadAvailableSlots = async () => {
    if (selectedProcedure && selectedDate) {
      const response = await appointmentsAPI.getAvailableSlots(
        'professional-id-here', // TODO: Get from selected procedure or user preference
        selectedDate,
        selectedProcedure.id
      );
      setAvailableSlots(response.data.slots);
    }
  };

  useEffect(() => {
    if (step === 3 && selectedDate) {
      loadAvailableSlots();
    }
  }, [step, selectedDate]);

  const handleConfirm = async () => {
    const patientId = localStorage.getItem('user_id');
    await appointmentsAPI.create({
      paciente_id: patientId,
      procedimento_id: selectedProcedure.id,
      professional_id: 'professional-id-here',
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      source: 'pwa'
    });
    navigate('/appointments');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Novo Agendamento</h2>
          <p className="text-gray-600">Passo {step} de 4</p>
        </div>
      </div>

      {/* Step 1: Select Procedure */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Escolha o Procedimento</h3>
          <div className="space-y-3">
            {procedures.map((proc: any) => (
              <button
                key={proc.id}
                onClick={() => {
                  setSelectedProcedure(proc);
                  setStep(2);
                }}
                className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{proc.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{proc.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">R$ {proc.price?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{proc.duration} min</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Escolha a Data</h3>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          {selectedDate && (
            <button
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Próximo
            </button>
          )}
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Escolha o Horário</h3>
          <div className="grid grid-cols-3 gap-3">
            {availableSlots.map((slot: any, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSlot(slot);
                  setStep(4);
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <Clock size={20} className="mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-semibold">{slot.display}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Confirmar Agendamento</h3>
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <p className="text-sm text-gray-600">Procedimento</p>
              <p className="font-semibold">{selectedProcedure?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="font-semibold">{new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Horário</p>
              <p className="font-semibold">{selectedSlot?.display}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor</p>
              <p className="font-semibold text-blue-600">R$ {selectedProcedure?.price?.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg"
          >
            Confirmar Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
