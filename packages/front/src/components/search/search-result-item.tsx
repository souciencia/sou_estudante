// components/SearchResultItem.tsx
import { Typo } from '@/components/text/typo';
import type { OfertaCompleta } from '@/services/api/types';
import { Card } from '../card';

interface SearchResultItemProps {
  oferta: OfertaCompleta;
}

export default function SearchResultItem({ oferta }: SearchResultItemProps) {
  // Extrair dados da estrutura completa
  const nomeCurso = oferta.curso?.no_curso || 'Curso não especificado';
  const siglaIES = oferta.instituicao?.sg_ies || '';
  const nomeIES = oferta.instituicao?.no_ies || 'Instituição não especificada';
  const grauAcademico = oferta.curso?.no_grau_academico || '';
  const modalidade = oferta.curso?.no_modalidade_ensino || '';
  const municipio = oferta.localizacao?.no_municipio || '';
  const uf = oferta.localizacao?.sg_uf || '';
  const campus = oferta.localizacao?.no_campus || '';
  
  // Dados de qualidade
  const conceitoEnade = oferta.qualidade_mec?.conceito_enade_faixa;
  const cpc = oferta.qualidade_mec?.cpc_faixa;
  
  // Dados do SISU
  const notaCorte = oferta.sisu?.nu_notacorte;
  const turno = oferta.sisu?.ds_turno || '';
  const gratuito = oferta.curso?.in_gratuito;
  
  // Montar tags dinâmicas
  const tags: string[] = [];
  if (gratuito) tags.push('Gratuito');
  if (modalidade) tags.push(modalidade);
  if (turno) tags.push(turno);
  if (grauAcademico) tags.push(grauAcademico);

  // Localização completa
  const localizacaoCompleta = [municipio, uf].filter(Boolean).join(' - ');

  // Converter conceito ENADE para tipo aceito pelo componente
  const conceitoEnadeFormatado = conceitoEnade && 
    ['1', '2', '3', '4', '5'].includes(conceitoEnade.toString())
    ? (conceitoEnade.toString() as '1' | '2' | '3' | '4' | '5')
    : undefined;

  return (
    <Card>
      <Card.Header title={nomeCurso} subtitle={`${siglaIES} ${localizacaoCompleta ? `• ${localizacaoCompleta}` : ''}`}>
        {conceitoEnadeFormatado && <Card.IconEnade n={conceitoEnadeFormatado} />}
      </Card.Header>
      {tags.length > 0 && <Card.Tags source={tags} className="ml-11"/>}
      {notaCorte && <Card.ProgressBar title="Nota de corte" percentage={`${Math.round((notaCorte / 1000) * 100)}%`}/>}
    </Card>
  );
}