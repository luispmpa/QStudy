import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Projeto, Caderno, Materia, Questao, NovaQuestao } from '@/types';

function getUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Não autenticado');
  return uid;
}

// ─── Projetos ────────────────────────────────────────────────────────────────

export function listenProjetos(cb: (data: Projeto[]) => void): Unsubscribe {
  const uid = getUid();
  const q = query(collection(db, 'projetos'), where('userId', '==', uid));
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Projeto))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    cb(data);
  });
}

export async function criarProjeto(nome: string): Promise<void> {
  const uid = getUid();
  await addDoc(collection(db, 'projetos'), {
    nome,
    userId: uid,
    criadoEm: Date.now(),
  });
}

export async function renomearProjeto(id: string, nome: string): Promise<void> {
  await updateDoc(doc(db, 'projetos', id), { nome });
}

export async function excluirProjeto(id: string): Promise<void> {
  const uid = getUid();
  const batch = writeBatch(db);

  const [cadernos, materias, questoes] = await Promise.all([
    getDocs(query(collection(db, 'cadernos'), where('projetoId', '==', id), where('userId', '==', uid))),
    getDocs(query(collection(db, 'materias'), where('projetoId', '==', id), where('userId', '==', uid))),
    getDocs(query(collection(db, 'questoes'), where('projetoId', '==', id), where('userId', '==', uid))),
  ]);

  cadernos.docs.forEach((d) => batch.delete(d.ref));
  materias.docs.forEach((d) => batch.delete(d.ref));
  questoes.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'projetos', id));

  await batch.commit();
}

// ─── Cadernos ────────────────────────────────────────────────────────────────

export function listenCadernos(
  projetoId: string,
  cb: (data: Caderno[]) => void
): Unsubscribe {
  const uid = getUid();
  const q = query(
    collection(db, 'cadernos'),
    where('userId', '==', uid),
    where('projetoId', '==', projetoId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Caderno))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    cb(data);
  });
}

export async function criarCaderno(
  projetoId: string,
  nome: string
): Promise<void> {
  const uid = getUid();
  await addDoc(collection(db, 'cadernos'), {
    projetoId,
    nome,
    userId: uid,
    criadoEm: Date.now(),
  });
}

export async function renomearCaderno(id: string, nome: string): Promise<void> {
  await updateDoc(doc(db, 'cadernos', id), { nome });
}

export async function excluirCaderno(id: string): Promise<void> {
  const uid = getUid();
  const batch = writeBatch(db);

  const [materias, questoes] = await Promise.all([
    getDocs(query(collection(db, 'materias'), where('cadernoId', '==', id), where('userId', '==', uid))),
    getDocs(query(collection(db, 'questoes'), where('cadernoId', '==', id), where('userId', '==', uid))),
  ]);

  materias.docs.forEach((d) => batch.delete(d.ref));
  questoes.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'cadernos', id));

  await batch.commit();
}

// ─── Matérias ────────────────────────────────────────────────────────────────

export function listenMaterias(
  cadernoId: string,
  cb: (data: Materia[]) => void
): Unsubscribe {
  const uid = getUid();
  const q = query(
    collection(db, 'materias'),
    where('userId', '==', uid),
    where('cadernoId', '==', cadernoId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Materia))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    cb(data);
  });
}

export async function criarMateria(
  projetoId: string,
  cadernoId: string,
  nome: string
): Promise<void> {
  const uid = getUid();
  await addDoc(collection(db, 'materias'), {
    projetoId,
    cadernoId,
    nome,
    userId: uid,
    criadoEm: Date.now(),
  });
}

export async function renomearMateria(id: string, nome: string): Promise<void> {
  await updateDoc(doc(db, 'materias', id), { nome });
}

export async function excluirMateria(id: string): Promise<void> {
  const uid = getUid();
  const batch = writeBatch(db);

  const questoes = await getDocs(
    query(collection(db, 'questoes'), where('materiaId', '==', id), where('userId', '==', uid))
  );

  questoes.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'materias', id));

  await batch.commit();
}

// ─── Questões ────────────────────────────────────────────────────────────────

export function listenQuestoesPorMateria(
  materiaId: string,
  cb: (data: Questao[]) => void
): Unsubscribe {
  const uid = getUid();
  const q = query(
    collection(db, 'questoes'),
    where('userId', '==', uid),
    where('materiaId', '==', materiaId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Questao))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    cb(data);
  });
}

export function listenQuestoesPorProjeto(
  projetoId: string,
  cb: (data: Questao[]) => void
): Unsubscribe {
  const uid = getUid();
  const q = query(
    collection(db, 'questoes'),
    where('userId', '==', uid),
    where('projetoId', '==', projetoId)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Questao))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    cb(data);
  });
}

export async function criarQuestao(q: NovaQuestao): Promise<void> {
  const uid = getUid();
  await addDoc(collection(db, 'questoes'), {
    ...q,
    userId: uid,
    sm2: null,
    criadoEm: Date.now(),
  });
}

export async function criarQuestoesEmLote(qs: NovaQuestao[]): Promise<void> {
  const uid = getUid();
  const batch = writeBatch(db);
  qs.forEach((q) => {
    const ref = doc(collection(db, 'questoes'));
    batch.set(ref, {
      ...q,
      userId: uid,
      sm2: null,
      criadoEm: Date.now(),
    });
  });
  await batch.commit();
}

export async function atualizarQuestao(
  id: string,
  data: Partial<Questao>
): Promise<void> {
  await updateDoc(doc(db, 'questoes', id), data as Record<string, unknown>);
}

export async function excluirQuestao(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questoes', id));
}
