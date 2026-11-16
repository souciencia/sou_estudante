package ingest

// SourceRecord representa um registro do arquivo JSON de origem das IES, antes
// de ser mapeado no documento indexado. Os campos seguem o formato achatado da
// fonte (prefixo "ies_"), descrito em _data/dicionario_ies.csv.
type SourceRecord struct {
	NuAnoCenso *int   `json:"nu_ano_censo"`
	IESCoIES   *int   `json:"ies_co_ies"`
	IESNoIES   string `json:"ies_no_ies"`
	IESSgIES   string `json:"ies_sg_ies"`

	IESCoMantenedora *int   `json:"ies_co_mantenedora"`
	IESNoMantenedora string `json:"ies_no_mantenedora"`

	IESTpCategoriaAdministrativa *int   `json:"ies_tp_categoria_administrativa"`
	IESNoCategoriaAdministrativa string `json:"ies_no_categoria_administrativa"`

	IESTpOrganizacaoAcademica *int   `json:"ies_tp_organizacao_academica"`
	IESNoOrganizacaoAcademica string `json:"ies_no_organizacao_academica"`

	IESCoRegiao    *int   `json:"ies_co_regiao"`
	IESNoRegiao    string `json:"ies_no_regiao"`
	IESCoUF        *int   `json:"ies_co_uf"`
	IESNoUF        string `json:"ies_no_uf"`
	IESSgUF        string `json:"ies_sg_uf"`
	IESCoMunicipio *int   `json:"ies_co_municipio"`
	IESNoMunicipio string `json:"ies_no_municipio"`
	IESInCapital   *int   `json:"ies_in_capital"`

	IESCoMesorregiao  *int   `json:"ies_co_mesorregiao"`
	IESNoMesorregiao  string `json:"ies_no_mesorregiao"`
	IESCoMicrorregiao *int   `json:"ies_co_microrregiao"`
	IESNoMicrorregiao string `json:"ies_no_microrregiao"`

	IESTpRede         *int `json:"ies_tp_rede"`
	IESInComunitaria  *int `json:"ies_in_comunitaria"`
	IESInConfessional *int `json:"ies_in_confessional"`

	IESDsEndereco            string `json:"ies_ds_endereco"`
	IESDsNumeroEndereco      string `json:"ies_ds_numero_endereco"`
	IESDsComplementoEndereco string `json:"ies_ds_complemento_endereco"`
	IESNoBairro              string `json:"ies_no_bairro"`
	IESNuCEP                 string `json:"ies_nu_cep"`

	IESQtDocTotal  *int     `json:"ies_qt_doc_total"`
	IESQtDocExe    *int     `json:"ies_qt_doc_exe"`
	IESQtCursos    *int     `json:"ies_qt_cursos"`
	IESDocPorCurso *float64 `json:"ies_doc_por_curso"`

	IESQtDocExSemGrad       *int     `json:"ies_qt_doc_ex_sem_grad"`
	IESMediaSemGradPorCurso *float64 `json:"ies_media_sem_grad_por_curso"`
	IESPercSemGrad          *float64 `json:"ies_perc_sem_grad"`
	IESQtDocExGrad          *int     `json:"ies_qt_doc_ex_grad"`
	IESMediaGradPorCurso    *float64 `json:"ies_media_grad_por_curso"`
	IESPercGrad             *float64 `json:"ies_perc_grad"`
	IESQtDocExEsp           *int     `json:"ies_qt_doc_ex_esp"`
	IESMediaEspPorCurso     *float64 `json:"ies_media_esp_por_curso"`
	IESPercEsp              *float64 `json:"ies_perc_esp"`
	IESQtDocExMest          *int     `json:"ies_qt_doc_ex_mest"`
	IESMediaMestPorCurso    *float64 `json:"ies_media_mest_por_curso"`
	IESPercMestres          *float64 `json:"ies_perc_mestres"`
	IESQtDocExDout          *int     `json:"ies_qt_doc_ex_dout"`
	IESMediaDoutPorCurso    *float64 `json:"ies_media_dout_por_curso"`
	IESPercDoutores         *float64 `json:"ies_perc_doutores"`

	IESQtVg             *int     `json:"ies_qt_vg"`
	IESQtIng            *int     `json:"ies_qt_ing"`
	IESQtMat            *int     `json:"ies_qt_mat"`
	IESMediaIngPorCurso *float64 `json:"ies_media_ing_por_curso"`
	IESMediaMatPorCurso *float64 `json:"ies_media_mat_por_curso"`
	IESMediaVgPorCurso  *float64 `json:"ies_media_vg_por_curso"`

	DtCarga string `json:"dt_carga"`
}
